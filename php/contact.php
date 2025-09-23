<?php
/**
 * Duace Music - Contact Form Handler
 * Server-side form processing with email sending and validation
 */

// Security headers
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// CORS settings (adjust for your domain)
$allowed_origins = [
    'https://duacemusic.com',
    'https://www.duacemusic.com',
    'http://localhost/' // For development
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Configuration
$config = [
    'email' => [
        'to' => 'contact@duacemusic.com',
        'from_name' => 'Duace Music Website',
        'from_email' => 'noreply@duacemusic.com',
        'subject_prefix' => '[Duace Music Contact] '
    ],
    'rate_limiting' => [
        'enabled' => true,
        'max_attempts' => 5,
        'time_window' => 3600 // 1 hour
    ],
    'spam_protection' => [
        'honeypot_field' => 'website', // Hidden field
        'time_threshold' => 3 // Minimum seconds to fill form
    ]
];

/**
 * Rate limiting class
 */
class RateLimiter {
    private $storage_file;
    private $max_attempts;
    private $time_window;
    
    public function __construct($max_attempts = 5, $time_window = 3600) {
        $this->storage_file = sys_get_temp_dir() . '/duace_rate_limit.json';
        $this->max_attempts = $max_attempts;
        $this->time_window = $time_window;
    }
    
    public function isAllowed($ip) {
        $data = $this->loadData();
        $now = time();
        
        // Clean old entries
        $data = array_filter($data, function($entry) use ($now) {
            return ($now - $entry['timestamp']) < $this->time_window;
        });
        
        // Count attempts for this IP
        $attempts = array_filter($data, function($entry) use ($ip) {
            return $entry['ip'] === $ip;
        });
        
        $allowed = count($attempts) < $this->max_attempts;
        
        if ($allowed) {
            // Record this attempt
            $data[] = [
                'ip' => $ip,
                'timestamp' => $now
            ];
            $this->saveData($data);
        }
        
        return $allowed;
    }
    
    private function loadData() {
        if (!file_exists($this->storage_file)) {
            return [];
        }
        
        $content = file_get_contents($this->storage_file);
        return json_decode($content, true) ?: [];
    }
    
    private function saveData($data) {
        file_put_contents($this->storage_file, json_encode($data));
    }
}

/**
 * Form validator class
 */
class FormValidator {
    private $errors = [];
    
    public function validateRequired($field, $value, $name) {
        if (empty(trim($value))) {
            $this->errors[$field] = "$name is required";
            return false;
        }
        return true;
    }
    
    public function validateEmail($field, $value) {
        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $this->errors[$field] = "Please enter a valid email address";
            return false;
        }
        return true;
    }
    
    public function validateLength($field, $value, $max_length, $name) {
        if (strlen($value) > $max_length) {
            $this->errors[$field] = "$name must be less than $max_length characters";
            return false;
        }
        return true;
    }
    
    public function validatePhone($field, $value) {
        if (!empty($value) && !preg_match('/^[\+]?[1-9][\d]{0,15}$/', $value)) {
            $this->errors[$field] = "Please enter a valid phone number";
            return false;
        }
        return true;
    }
    
    public function getErrors() {
        return $this->errors;
    }
    
    public function hasErrors() {
        return !empty($this->errors);
    }
}

/**
 * Email sender class
 */
class EmailSender {
    private $config;
    
    public function __construct($config) {
        $this->config = $config;
    }
    
    public function send($data) {
        $to = $this->config['to'];
        $subject = $this->config['subject_prefix'] . $this->getSubjectFromData($data);
        $message = $this->buildMessage($data);
        $headers = $this->buildHeaders();
        
        return mail($to, $subject, $message, $headers);
    }
    
    private function getSubjectFromData($data) {
        $project_type = $data['subject'] ?? 'General Inquiry';
        return "New Contact Form: $project_type";
    }
    
    private function buildMessage($data) {
        $message = "New contact form submission from Duace Music website:\n\n";
        
        $fields = [
            'name' => 'Name',
            'email' => 'Email',
            'phone' => 'Phone',
            'subject' => 'Project Type',
            'budget' => 'Budget',
            'timeline' => 'Timeline',
            'message' => 'Message',
            'newsletter' => 'Newsletter Subscription'
        ];
        
        foreach ($fields as $field => $label) {
            if (isset($data[$field]) && !empty($data[$field])) {
                $value = $data[$field];
                if ($field === 'newsletter') {
                    $value = $value === 'yes' ? 'Yes' : 'No';
                }
                $message .= "$label: $value\n";
            }
        }
        
        $message .= "\n---\n";
        $message .= "Submitted: " . date('Y-m-d H:i:s') . "\n";
        $message .= "IP Address: " . $this->getClientIP() . "\n";
        $message .= "User Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown') . "\n";
        
        return $message;
    }
    
    private function buildHeaders() {
        $headers = "From: {$this->config['from_name']} <{$this->config['from_email']}>\r\n";
        $headers .= "Reply-To: {$this->config['from_email']}\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
        
        return $headers;
    }
    
    private function getClientIP() {
        $ip_fields = ['HTTP_CF_CONNECTING_IP', 'HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
        
        foreach ($ip_fields as $field) {
            if (!empty($_SERVER[$field])) {
                $ip = $_SERVER[$field];
                // Handle comma-separated IPs
                if (strpos($ip, ',') !== false) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }
        
        return 'Unknown';
    }
}

/**
 * Main form processor
 */
class ContactFormProcessor {
    private $config;
    private $rate_limiter;
    private $validator;
    private $email_sender;
    
    public function __construct($config) {
        $this->config = $config;
        $this->rate_limiter = new RateLimiter(
            $config['rate_limiting']['max_attempts'],
            $config['rate_limiting']['time_window']
        );
        $this->validator = new FormValidator();
        $this->email_sender = new EmailSender($config['email']);
    }
    
    public function process() {
        try {
            // Get client IP
            $client_ip = $this->getClientIP();
            
            // Check rate limiting
            if ($this->config['rate_limiting']['enabled'] && !$this->rate_limiter->isAllowed($client_ip)) {
                return $this->errorResponse('Too many requests. Please try again later.', 429);
            }
            
            // Get and sanitize input data
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            if (!$data) {
                // Try form data instead
                $data = $_POST;
            }
            
            if (empty($data)) {
                return $this->errorResponse('No data received');
            }
            
            // Sanitize input
            $data = $this->sanitizeData($data);
            
            // Spam protection
            if (!$this->passesSpamProtection($data)) {
                return $this->errorResponse('Request blocked by spam protection');
            }
            
            // Validate form data
            if (!$this->validateData($data)) {
                return $this->errorResponse('Validation failed', 400, $this->validator->getErrors());
            }
            
            // Send email
            if (!$this->email_sender->send($data)) {
                return $this->errorResponse('Failed to send email. Please try again.');
            }
            
            // Log successful submission (optional)
            $this->logSubmission($data, $client_ip);
            
            return $this->successResponse('Message sent successfully!');
            
        } catch (Exception $e) {
            error_log("Contact form error: " . $e->getMessage());
            return $this->errorResponse('An error occurred. Please try again.');
        }
    }
    
    private function sanitizeData($data) {
        $sanitized = [];
        
        foreach ($data as $key => $value) {
            if (is_string($value)) {
                // Remove HTML tags and trim whitespace
                $sanitized[$key] = trim(strip_tags($value));
            } else {
                $sanitized[$key] = $value;
            }
        }
        
        return $sanitized;
    }
    
    private function passesSpamProtection($data) {
        // Honeypot field check
        if (!empty($data[$this->config['spam_protection']['honeypot_field']])) {
            return false;
        }
        
        // Time-based check (if timestamp is provided)
        if (isset($data['form_start_time'])) {
            $time_spent = time() - intval($data['form_start_time']);
            if ($time_spent < $this->config['spam_protection']['time_threshold']) {
                return false;
            }
        }
        
        // Simple keyword spam check
        $spam_keywords = ['viagra', 'cialis', 'casino', 'poker', 'loan', 'credit'];
        $content = strtolower(($data['message'] ?? '') . ' ' . ($data['name'] ?? ''));
        
        foreach ($spam_keywords as $keyword) {
            if (strpos($content, $keyword) !== false) {
                return false;
            }
        }
        
        return true;
    }
    
    private function validateData($data) {
        // Required field validation
        $this->validator->validateRequired('name', $data['name'] ?? '', 'Name');
        $this->validator->validateRequired('email', $data['email'] ?? '', 'Email');
        $this->validator->validateRequired('message', $data['message'] ?? '', 'Message');
        
        // Email validation
        if (!empty($data['email'])) {
            $this->validator->validateEmail('email', $data['email']);
        }
        
        // Phone validation (optional field)
        if (!empty($data['phone'])) {
            $this->validator->validatePhone('phone', $data['phone']);
        }
        
        // Length validation
        $this->validator->validateLength('name', $data['name'] ?? '', 100, 'Name');
        $this->validator->validateLength('message', $data['message'] ?? '', 2000, 'Message');
        
        // Privacy policy agreement
        if (empty($data['privacy'])) {
            $this->validator->validateRequired('privacy', '', 'Privacy policy agreement');
        }
        
        return !$this->validator->hasErrors();
    }
    
    private function logSubmission($data, $ip) {
        $log_entry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'ip' => $ip,
            'name' => $data['name'] ?? '',
            'email' => $data['email'] ?? '',
            'project_type' => $data['subject'] ?? '',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
        ];
        
        $log_file = __DIR__ . '/logs/contact_submissions.log';
        $log_dir = dirname($log_file);
        
        // Create logs directory if it doesn't exist
        if (!is_dir($log_dir)) {
            mkdir($log_dir, 0755, true);
        }
        
        file_put_contents($log_file, json_encode($log_entry) . "\n", FILE_APPEND | LOCK_EX);
    }
    
    private function getClientIP() {
        $ip_fields = ['HTTP_CF_CONNECTING_IP', 'HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
        
        foreach ($ip_fields as $field) {
            if (!empty($_SERVER[$field])) {
                $ip = $_SERVER[$field];
                if (strpos($ip, ',') !== false) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }
        
        return 'Unknown';
    }
    
    private function successResponse($message) {
        http_response_code(200);
        return json_encode([
            'success' => true,
            'message' => $message
        ]);
    }
    
    private function errorResponse($message, $code = 400, $errors = null) {
        http_response_code($code);
        $response = [
            'success' => false,
            'message' => $message
        ];
        
        if ($errors) {
            $response['errors'] = $errors;
        }
        
        return json_encode($response);
    }
}

// Process the form
try {
    $processor = new ContactFormProcessor($config);
    echo $processor->process();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error occurred'
    ]);
    error_log("Contact form fatal error: " . $e->getMessage());
}
?>
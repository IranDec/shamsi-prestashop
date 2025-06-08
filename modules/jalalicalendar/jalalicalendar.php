<?php
if (!defined('_PS_VERSION_')) {
    exit;
}

class JalaliCalendar extends Module
{
    public function __construct()
    {
        $this->name = 'jalalicalendar';
        $this->tab = 'administration'; // Or any other relevant tab
        $this->version = '1.0.0';
        $this->author = 'AI Developer'; // Replace with actual author
        $this->need_instance = 0;
        $this->ps_versions_compliancy = [
            'min' => '1.7.8.0',
            'max' => _PS_VERSION_
        ];
        $this->bootstrap = true;

        parent::__construct();

        $this->displayName = $this->l('Jalali Calendar');
        $this->description = $this->l('Replaces Gregorian calendars in the back office with Jalali calendars.');

        $this->confirmUninstall = $this->l('Are you sure you want to uninstall?');
    }

    public function install()
    {
        if (!parent::install() ||
            !$this->registerHook('actionAdminControllerSetMedia') // For adding JS/CSS
            // Add any other hooks you might need, e.g., for specific calendar instances
        ) {
            return false;
        }
        return true;
    }

    public function uninstall()
    {
        if (!parent::uninstall()) {
            return false;
        }
        return true;
    }

    /**
     * Add the CSS & JavaScript files you want to be loaded in the BO.
     */
    public function hookActionAdminControllerSetMedia()
    {
        // Add persian-datepicker library CSS
        $this->context->controller->addCSS($this->_path . 'views/css/lib/persian-datepicker.min.css');
        // Add module's custom CSS (ensure it loads after the library's CSS if needed for overrides)
        $this->context->controller->addCSS($this->_path . 'views/css/jalalicalendar_admin.css');

        // Add persian-datepicker library JS
        $this->context->controller->addJS($this->_path . 'views/js/lib/persian-datepicker.min.js');
        // Add module's custom JS (ensure it loads after the library's JS)
        $this->context->controller->addJS($this->_path . 'views/js/jalalicalendar_admin.js');
    }
}

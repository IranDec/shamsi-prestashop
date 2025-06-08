$(document).ready(function() {
    // PrestaShop datepickers might be initialized with classes like 'datepicker' or 'js-datepicker'
    // It's also common for them to be input[type="date"] or have data-provide="datepicker"
    // We need to be somewhat generic here.
    var $dateInputs = $('input.datepicker, input.js-datepicker, input[data-provide="datepicker"]');

    if ($dateInputs.length > 0) {
        $dateInputs.each(function() {
            var $input = $(this);

            // If jQuery UI datepicker is attached, try to destroy it.
            if (typeof $input.datepicker === 'function' && $input.hasClass('hasDatepicker')) {
                try {
                    $input.datepicker('destroy');
                } catch (e) {
                    console.warn('Could not destroy jQuery UI datepicker:', e);
                }
            }

            // Remove classes that might conflict or re-trigger Gregorian datepickers
            $input.removeClass('datepicker js-datepicker hasDatepicker');
            // Remove data attributes from other datepickers
            $input.removeAttr('data-provide');


            // Initialize persian-datepicker
            // The initial value from PrestaShop will be Gregorian.
            // The persian-datepicker should ideally handle this or we might need to convert.
            var gregorianDate = $input.val();
            var initialUnix = null;
            if (gregorianDate) {
                // Attempt to parse YYYY-MM-DD or DD/MM/YYYY
                var parts = gregorianDate.match(/(\d{4})-(\d{2})-(\d{2})/); // YYYY-MM-DD
                if (!parts) {
                    parts = gregorianDate.match(/(\d{2})\/(\d{2})\/(\d{4})/); // DD/MM/YYYY - needs reordering for Date
                    if (parts) {
                        gregorianDate = parts[3] + '-' + parts[2] + '-' + parts[1];
                    }
                }
                if (gregorianDate) { // check if parsing was successful
                     initialUnix = new Date(gregorianDate).getTime();
                }
            }

            $input.pDatepicker({
                format: 'YYYY-MM-DD', // Output format for the input field (Gregorian)
                formatter: function(unixDate){ // This function is called when a date is picked
                    // Convert unix timestamp to YYYY-MM-DD Gregorian for PrestaShop
                    var date = new Date(unixDate);
                    var year = date.getFullYear();
                    var month = ('0' + (date.getMonth() + 1)).slice(-2);
                    var day = ('0' + date.getDate()).slice(-2);
                    return year + '-' + month + '-' + day;
                },
                // initialValue: gregorianDate ? true : false, // let the library handle parsing if possible
                // initialValueType: gregorianDate ? 'gregorian' : null,
                autoClose: true,
                observer: true, // Important for dynamically added inputs
                altField: $input, // The input field itself will store the Gregorian date
                altFormat: 'YYYY-MM-DD', // Alt field format
                // calendarType: 'persian', // Default is persian
                   dayPicker: {
                       firstDayOfWeek: 6 // Set Friday as the first day of the week
                   }
            });

             // If there was an initial Gregorian date, set it in the Jalali picker
             // The library should convert it for display
             if (initialUnix) {
                 $input.pDatepicker('setDate', initialUnix);
             }

            // Clear any PrestaShop specific event listeners that might re-initialize their datepicker
            // This is a bit aggressive, but often necessary.
            $input.off('.datepicker');
        });

        // Handle dynamically added date fields (e.g., in specific price additions)
        // This might need more specific selectors based on PrestaShop's structure
        // For now, this is a general approach.
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    $(mutation.addedNodes).find('input.datepicker, input.js-datepicker, input[data-provide="datepicker"]').each(function() {
                        var $newInput = $(this);
                        if (typeof $newInput.datepicker === 'function' && $newInput.hasClass('hasDatepicker')) {
                            try {
                                $newInput.datepicker('destroy');
                            } catch (e) {
                                console.warn('Could not destroy jQuery UI datepicker on new element:', e);
                            }
                        }
                        $newInput.removeClass('datepicker js-datepicker hasDatepicker');
                        $newInput.removeAttr('data-provide');

                        var gregorianDateNew = $newInput.val();
                        var initialUnixNew = null;
                        if (gregorianDateNew) {
                            initialUnixNew = new Date(gregorianDateNew).getTime();
                        }

                        $newInput.pDatepicker({
                            format: 'YYYY-MM-DD',
                            formatter: function(unixDate){
                                var date = new Date(unixDate);
                                var year = date.getFullYear();
                                var month = ('0' + (date.getMonth() + 1)).slice(-2);
                                var day = ('0' + date.getDate()).slice(-2);
                                return year + '-' + month + '-' + day;
                            },
                            autoClose: true,
                            observer: true,
                            altField: $newInput,
                            altFormat: 'YYYY-MM-DD',
                               dayPicker: {
                                   firstDayOfWeek: 6 // Set Friday as the first day of the week
                               }
                        });
                        if (initialUnixNew) {
                            $newInput.pDatepicker('setDate', initialUnixNew);
                        }
                        $newInput.off('.datepicker');
                    });
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

    } else {
        console.log('JalaliCalendar: No datepicker inputs found on this page.');
    }
});

using Content.Modelling.Models.Components;
using Microsoft.AspNetCore.Html;
using System.Net;
using System.Text;


namespace RazorPageYourCouncilWebsite.Helpers.Html
{

    // Configuration options for the service contract display
    public class ServiceContactOptions
    {
        // Display options
        public bool ShowServiceType { get; set; } = true;
        public string ServiceTypeText { get; set; } = "Blackpool Council Service";
        public bool ShowOpeningHours { get; set; } = true;
        public string OpeningHoursText { get; set; } = "Monday to Friday, 9am to 5pm";

        // Content options
        public string? AdditionalInfo { get; set; }
        public string? AdditionalCssClasses { get; set; }
        public bool IncludeAddressLine2 { get; set; } = false;
        public string? AddressLine2 { get; set; }
        public string? AddressLine2Suffix { get; set; } = "<br>Blackpool";

        // Section visibility
        public bool ShowEmailSection { get; set; } = true;
        public bool ShowPhoneSection { get; set; } = true;
        public bool ShowAddressSection { get; set; } = true;
        public bool ShowSectionTitles { get; set; } = true;

        // Notes section
        public bool ShowNotesSection { get; set; } = true;
        public string NotesTitle { get; set; } = "Additional information";
        public string NotesCssClass { get; set; } = "contact-notes";
        public string NotesTitleTag { get; set; } = "h4";
        public bool ShowNotesAsList { get; set; } = false; // If notes contain multiple lines

        // Phone number priority
        public PhoneNumberPriority PhonePriority { get; set; } = PhoneNumberPriority.Telephone1ThenTelephoneThenTelephone2;

        // CSS customization
        public string ContainerCssClass { get; set; } = "govuk-service-details";
        public string ServiceTitleTag { get; set; } = "h1";
        public string ContactSectionTitleTag { get; set; } = "h2";
        public string MethodTitleTag { get; set; } = "h3";

        // Link behavior
        public bool OpenEmailInNewTab { get; set; } = false;
        public bool OpenPhoneInNewTab { get; set; } = false;
        public string LinkCssClass { get; set; } = "govuk-link";

        // Layout
        public ContactLayout Layout { get; set; } = ContactLayout.Grid;
        public bool CompactMode { get; set; } = false;

        // Accessibility
        public bool AddAriaLabels { get; set; } = true;
        public string EmailAriaLabel { get; set; } = "Send email to service";
        public string PhoneAriaLabel { get; set; } = "Call service";

        // Empty state handling
        public bool HideEmptySections { get; set; } = true;
        public string EmptyStateMessage { get; set; } = "Contact information not available";
    }

    public enum PhoneNumberPriority
    {
        Telephone1ThenTelephoneThenTelephone2,
        TelephoneThenTelephone1ThenTelephone2,
        Telephone2ThenTelephone1ThenTelephone,
        FirstNonEmpty
    }

    public enum ContactLayout
    {
        Grid,
        List,
        Cards,
        Horizontal
    }

    // Main extension class
    public static class HtmlServiceContactExtensions
    {
        public static void AppendServiceContact(this IHtmlContentBuilder htmlContent,
            ServiceContact serviceContact,
            ServiceContactOptions? options = null)
        {
            if (serviceContact == null)
                return;

            options ??= new ServiceContactOptions();

            var sections = new List<string>();

            if (options.ShowEmailSection && !string.IsNullOrEmpty(serviceContact.EmailAddress))
            {
                sections.Add(RenderEmailSection(serviceContact, options));
            }

            if (options.ShowPhoneSection)
            {
                var phoneSection = RenderPhoneSection(serviceContact, options);
                if (!string.IsNullOrEmpty(phoneSection))
                {
                    sections.Add(phoneSection);
                }
            }

            if (options.ShowAddressSection && !string.IsNullOrEmpty(serviceContact.Address))
            {
                sections.Add(RenderAddressSection(serviceContact, options));
            }

            // Add Notes section
            if (options.ShowNotesSection && !string.IsNullOrEmpty(serviceContact.Notes))
            {
                sections.Add(RenderNotesSection(serviceContact, options));
            }

            // Handle empty state
            if (sections.Count == 0 && options.HideEmptySections)
            {
                if (!string.IsNullOrEmpty(options.EmptyStateMessage))
                {
                    htmlContent.AppendHtml($@"
                                <div class=""{options.ContainerCssClass} empty-state"">
                                    <p class=""empty-message"">{HtmlEncode(options.EmptyStateMessage)}</p>
                                </div>");
                }
                return;
            }

            var layoutClass = GetLayoutClass(options.Layout);
            var containerClass = $"{options.ContainerCssClass} {options.AdditionalCssClasses} {layoutClass}".Trim();

            if (options.CompactMode)
            {
                containerClass += " compact-mode";
            }

            var html = $@"
                    <div class=""{containerClass}"">
                        <div class=""service-banner"">
                            <div class=""service-title"">
                                <{options.ServiceTitleTag} class=""service-name"">{HtmlEncode(serviceContact.ServiceName)}</{options.ServiceTitleTag}>
                                {(options.ShowServiceType ? $@"<p class=""service-type"">{HtmlEncode(options.ServiceTypeText)}</p>" : "")}
                            </div>
                        </div>
    
                        <div class=""contact-details-section"">
                            {(options.ShowSectionTitles ? $@"<{options.ContactSectionTitleTag} class=""section-title"">Contact this service</{options.ContactSectionTitleTag}>" : "")}
        
                            <div class=""contact-{options.Layout.ToString().ToLower()}"">
                                {string.Join("\n", sections)}
                            </div>
                            {RenderAdditionalInfo(options)}
                        </div>
                    </div>";

            htmlContent.AppendHtml(html);
        }

        private static string RenderEmailSection(ServiceContact serviceContact, ServiceContactOptions options)
        {
            var targetAttr = options.OpenEmailInNewTab ? " target=\"_blank\" rel=\"noopener noreferrer\"" : "";
            var ariaLabel = options.AddAriaLabels ? $" aria-label=\"{options.EmailAriaLabel}\"" : "";

            return $@"
            <div class=""contact-method contact-email"">
                <{options.MethodTitleTag} class=""method-title"">By email</{options.MethodTitleTag}>
                <p class=""method-detail"">
                    <a href=""mailto:{serviceContact.EmailAddress}"" class=""{options.LinkCssClass}""{targetAttr}{ariaLabel}>
                        {HtmlEncode(serviceContact.EmailAddress)}
                    </a>
                </p>
            </div>";
        }

        private static string RenderPhoneSection(ServiceContact serviceContact, ServiceContactOptions options)
        {
            var phoneNumber = GetPrimaryPhoneNumber(serviceContact, options.PhonePriority);

            if (string.IsNullOrEmpty(phoneNumber))
                return string.Empty;

            var telLink = FormatPhoneNumberForLink(phoneNumber);
            var targetAttr = options.OpenPhoneInNewTab ? " target=\"_blank\" rel=\"noopener noreferrer\"" : "";
            var ariaLabel = options.AddAriaLabels ? $" aria-label=\"{options.PhoneAriaLabel}\"" : "";

            var openingHours = options.ShowOpeningHours && !string.IsNullOrEmpty(options.OpeningHoursText)
                ? $@"<p class=""opening-hours"">{HtmlEncode(options.OpeningHoursText)}</p>"
                : "";

            return $@"
                    <div class=""contact-method contact-phone"">
                        <{options.MethodTitleTag} class=""method-title"">By telephone</{options.MethodTitleTag}>
                        <p class=""method-detail"">
                            <a href=""tel:{telLink}"" class=""{options.LinkCssClass}""{targetAttr}{ariaLabel}>
                                {HtmlEncode(phoneNumber)}
                            </a>
                        </p>
                        {openingHours}
                    </div>";
        }

        private static string RenderAddressSection(ServiceContact serviceContact, ServiceContactOptions options)
        {
            var address = HtmlEncode(serviceContact.Address).Replace("\n", "<br>");

            if (options.IncludeAddressLine2 && !string.IsNullOrEmpty(options.AddressLine2))
            {
                address += $@"<br>{HtmlEncode(options.AddressLine2)}";
            }
            else if (!string.IsNullOrEmpty(options.AddressLine2Suffix))
            {
                address += options.AddressLine2Suffix;
            }

            return $@"
                <div class=""contact-method contact-address"">
                    <{options.MethodTitleTag} class=""method-title"">By post</{options.MethodTitleTag}>
                    <p class=""method-detail"">
                        {address}
                    </p>
                </div>";
        }

        private static string RenderNotesSection(ServiceContact serviceContact, ServiceContactOptions options)
        {
            var notes = HtmlEncode(serviceContact.Notes);

            // If notes contain multiple lines, we can format them as a list
            var notesContent = notes;
            if (options.ShowNotesAsList && notes.Contains("\n"))
            {
                var items = notes.Split(new[] { '\n' }, StringSplitOptions.RemoveEmptyEntries);
                var listItems = string.Join("\n", items.Select(item => $"<li>{item.Trim()}</li>"));
                notesContent = $@"<ul class=""notes-list"">{listItems}</ul>";
            }
            else
            {
                // Replace newlines with <br> for better formatting
                notesContent = notes.Replace("\n", "<br>");
            }

            return $@"
                <div class=""{options.NotesCssClass}"">
                    <{options.NotesTitleTag} class=""notes-title"">{HtmlEncode(options.NotesTitle)}</{options.NotesTitleTag}>
                    <div class=""notes-content"">
                        {notesContent}
                    </div>
                </div>";
        }

        private static string RenderAdditionalInfo(ServiceContactOptions options)
        {
            if (string.IsNullOrEmpty(options.AdditionalInfo))
                return string.Empty;

            return $@"
                <div class=""additional-info"">
                    <p>{HtmlEncode(options.AdditionalInfo)}</p>
                </div>";
        }

        private static string? GetPrimaryPhoneNumber(ServiceContact serviceContact, PhoneNumberPriority priority)
        {
            return priority switch
            {
                PhoneNumberPriority.Telephone1ThenTelephoneThenTelephone2 =>
                    !string.IsNullOrEmpty(serviceContact.Telephone1) ? serviceContact.Telephone1 :
                    !string.IsNullOrEmpty(serviceContact.Telephone1) ? serviceContact.Telephone1 :
                    serviceContact.Telephone2,

                PhoneNumberPriority.TelephoneThenTelephone1ThenTelephone2 =>
                    !string.IsNullOrEmpty(serviceContact.Telephone1) ? serviceContact.Telephone1 :
                    !string.IsNullOrEmpty(serviceContact.Telephone2) ? serviceContact.Telephone2 :
                    serviceContact.Telephone2,

                PhoneNumberPriority.Telephone2ThenTelephone1ThenTelephone =>
                    !string.IsNullOrEmpty(serviceContact.Telephone2) ? serviceContact.Telephone2 :
                    !string.IsNullOrEmpty(serviceContact.Telephone1) ? serviceContact.Telephone1 :
                    serviceContact.Telephone1,

                PhoneNumberPriority.FirstNonEmpty =>
                    !string.IsNullOrEmpty(serviceContact.Telephone1) ? serviceContact.Telephone1 :
                    !string.IsNullOrEmpty(serviceContact.Telephone2) ? serviceContact.Telephone2 :
                    !string.IsNullOrEmpty(serviceContact.Telephone3) ? serviceContact.Telephone3 :
                    null,

                _ => serviceContact.Telephone1
            };
        }

        private static string FormatPhoneNumberForLink(string phoneNumber)
        {
            if (string.IsNullOrEmpty(phoneNumber))
                return string.Empty;

            // Remove all non-numeric characters except plus sign for international numbers
            var result = new StringBuilder();
            foreach (char c in phoneNumber)
            {
                if (char.IsDigit(c) || c == '+')
                {
                    result.Append(c);
                }
            }
            return result.ToString();
        }

        private static string GetLayoutClass(ContactLayout layout)
        {
            return layout switch
            {
                ContactLayout.Grid => "layout-grid",
                ContactLayout.List => "layout-list",
                ContactLayout.Cards => "layout-cards",
                ContactLayout.Horizontal => "layout-horizontal",
                _ => "layout-grid"
            };
        }

        private static string HtmlEncode(string? text)
        {
            if (string.IsNullOrEmpty(text))
                return string.Empty;

            return WebUtility.HtmlEncode(text);
        }

        // Alternative: String extension method for quick HTML generation
        public static string ToContactCardHtml(this ServiceContact serviceContact, ServiceContactOptions? options = null)
        {
            var htmlContent = new HtmlContentBuilder();
            htmlContent.AppendServiceContact(serviceContact, options);
            return htmlContent.ToString() ?? string.Empty;
        }
    }

    #region optional helper for generating CSS code

    // Optional helper for generating default CSS
    public static class ServiceContactCss
    {
        public static string GetDefaultStyles(bool minified = false)
        {
            return minified ? GetMinifiedStyles() : GetExpandedStyles();
        }

        private static string GetExpandedStyles()
        {
            return @"
                /* Service Contact Card Styles */
                .govuk-service-details {
                    font-family: 'Arial', sans-serif;
                    border: 1px solid #b1b4b6;
                    border-radius: 4px;
                    margin: 20px 0;
                    background: #fff;
                }
        
                .service-banner {
                    background: #005ea5;
                    color: white;
                    padding: 20px;
                    border-radius: 4px 4px 0 0;
                }
        
                .service-title .service-name {
                    color: white;
                    margin: 0 0 10px 0;
                    font-size: 32px;
                    font-weight: 700;
                    line-height: 1.2;
                }
        
                .service-type {
                    margin: 0;
                    font-size: 19px;
                    opacity: 0.9;
                    font-weight: 400;
                }
        
                .contact-details-section {
                    padding: 30px;
                }
        
                .section-title {
                    margin-top: 0;
                    margin-bottom: 25px;
                    font-size: 27px;
                    font-weight: 700;
                    color: #0b0c0c;
                    line-height: 1.2;
                }
        
                .contact-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 30px;
                }
        
                .contact-method {
                    margin-bottom: 20px;
                }
        
                .method-title {
                    margin-top: 0;
                    margin-bottom: 10px;
                    font-size: 19px;
                    font-weight: 700;
                    color: #0b0c0c;
                    line-height: 1.3;
                }
        
                .method-detail {
                    margin: 0 0 10px 0;
                    font-size: 16px;
                    line-height: 1.5;
                }
        
                .method-detail a {
                    word-break: break-all;
                }
        
                .opening-hours {
                    margin: 5px 0 0 0;
                    font-size: 14px;
                    color: #505a5f;
                    font-style: italic;
                    line-height: 1.4;
                }
        
                .govuk-link {
                    color: #005ea5;
                    text-decoration: underline;
                    text-decoration-thickness: 1px;
                }
        
                .govuk-link:hover {
                    color: #003078;
                    text-decoration-thickness: 3px;
                }
        
                .additional-info {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #b1b4b6;
                    color: #505a5f;
                    font-size: 14px;
                    line-height: 1.5;
                }

                /* Notes styles */
                .contact-notes {
                    margin-top: 20px;
                    padding-top: 15px;
                    border-top: 1px solid #e5e5e5;
                }

                .notes-title {
                    margin-top: 0;
                    margin-bottom: 10px;
                    font-size: 19px;
                    font-weight: 700;
                    color: #0b0c0c;
                    line-height: 1.3;
                }

                .notes-content {
                    font-size: 16px;
                    line-height: 1.6;
                    color: #0b0c0c;
                }

                .notes-content ul.notes-list {
                    margin: 5px 0;
                    padding-left: 20px;
                }

                .notes-content ul.notes-list li {
                    margin-bottom: 5px;
                }

                .notes-content p {
                    margin: 5px 0;
                }
        
                /* Layout variations */
                .layout-list .contact-grid {
                    display: block;
                }
        
                .layout-cards .contact-method {
                    border: 1px solid #b1b4b6;
                    border-radius: 4px;
                    padding: 20px;
                    background: #f8f8f8;
                    transition: box-shadow 0.3s ease;
                }
        
                .layout-cards .contact-method:hover {
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
        
                .layout-horizontal .contact-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 20px;
                }
        
                .layout-horizontal .contact-method {
                    flex: 1;
                    min-width: 200px;
                }
        
                /* Compact mode */
                .compact-mode {
                    font-size: 14px;
                }
        
                .compact-mode .service-name {
                    font-size: 24px;
                }
        
                .compact-mode .section-title {
                    font-size: 22px;
                }
        
                .compact-mode .contact-details-section {
                    padding: 20px;
                }
        
                .compact-mode .method-title {
                    font-size: 16px;
                }
        
                .compact-mode .method-detail {
                    font-size: 14px;
                }

                .compact-mode .notes-title {
                    font-size: 16px;
                }

                .compact-mode .notes-content {
                    font-size: 14px;
                }
        
                /* Empty state */
                .govuk-service-details.empty-state {
                    text-align: center;
                    padding: 40px 20px;
                }
        
                .empty-message {
                    color: #505a5f;
                    font-style: italic;
                    margin: 0;
                    font-size: 16px;
                }
        
                /* Responsive design */
                @media (max-width: 768px) {
                    .contact-grid {
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }
            
                    .layout-horizontal .contact-grid {
                        flex-direction: column;
                        gap: 15px;
                    }
            
                    .layout-horizontal .contact-method {
                        min-width: 100%;
                    }
            
                    .service-name {
                        font-size: 24px;
                    }
            
                    .section-title {
                        font-size: 22px;
                    }
            
                    .contact-details-section {
                        padding: 20px;
                    }
            
                    .service-banner {
                        padding: 15px;
                    }

                    .notes-title {
                        font-size: 17px;
                    }
                    
                    .notes-content {
                        font-size: 15px;
                    }
                }
        
                @media (max-width: 480px) {
                    .service-name {
                        font-size: 20px;
                    }
            
                    .section-title {
                        font-size: 18px;
                    }
            
                    .method-title {
                        font-size: 17px;
                    }

                    .notes-title {
                        font-size: 16px;
                    }
                    
                    .notes-content {
                        font-size: 14px;
                    }
                }";
        }

        private static string GetMinifiedStyles()
        {
            return @".govuk-service-details{font-family:'Arial',sans-serif;border:1px solid #b1b4b6;border-radius:4px;margin:20px 0;background:#fff}.service-banner{background:#005ea5;color:#fff;padding:20px;border-radius:4px 4px 0 0}.service-title .service-name{color:#fff;margin:0 0 10px;font-size:32px;font-weight:700;line-height:1.2}.service-type{margin:0;font-size:19px;opacity:.9;font-weight:400}.contact-details-section{padding:30px}.section-title{margin-top:0;margin-bottom:25px;font-size:27px;font-weight:700;color:#0b0c0c;line-height:1.2}.contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:30px}.contact-method{margin-bottom:20px}.method-title{margin-top:0;margin-bottom:10px;font-size:19px;font-weight:700;color:#0b0c0c;line-height:1.3}.method-detail{margin:0 0 10px;font-size:16px;line-height:1.5}.method-detail a{word-break:break-all}.opening-hours{margin:5px 0 0;font-size:14px;color:#505a5f;font-style:italic;line-height:1.4}.govuk-link{color:#005ea5;text-decoration:underline;text-decoration-thickness:1px}.govuk-link:hover{color:#003078;text-decoration-thickness:3px}.additional-info{margin-top:30px;padding-top:20px;border-top:1px solid #b1b4b6;color:#505a5f;font-size:14px;line-height:1.5}.contact-notes{margin-top:20px;padding-top:15px;border-top:1px solid #e5e5e5}.notes-title{margin-top:0;margin-bottom:10px;font-size:19px;font-weight:700;color:#0b0c0c;line-height:1.3}.notes-content{font-size:16px;line-height:1.6;color:#0b0c0c}.notes-content ul.notes-list{margin:5px 0;padding-left:20px}.notes-content ul.notes-list li{margin-bottom:5px}.notes-content p{margin:5px 0}.layout-list .contact-grid{display:block}.layout-cards .contact-method{border:1px solid #b1b4b6;border-radius:4px;padding:20px;background:#f8f8f8;transition:box-shadow .3s ease}.layout-cards .contact-method:hover{box-shadow:0 2px 8px rgba(0,0,0,.1)}.layout-horizontal .contact-grid{display:flex;flex-wrap:wrap;gap:20px}.layout-horizontal .contact-method{flex:1;min-width:200px}.compact-mode{font-size:14px}.compact-mode .service-name{font-size:24px}.compact-mode .section-title{font-size:22px}.compact-mode .contact-details-section{padding:20px}.compact-mode .method-title{font-size:16px}.compact-mode .method-detail{font-size:14px}.compact-mode .notes-title{font-size:16px}.compact-mode .notes-content{font-size:14px}.govuk-service-details.empty-state{text-align:center;padding:40px 20px}.empty-message{color:#505a5f;font-style:italic;margin:0;font-size:16px}@media (max-width:768px){.contact-grid{grid-template-columns:1fr;gap:20px}.layout-horizontal .contact-grid{flex-direction:column;gap:15px}.layout-horizontal .contact-method{min-width:100%}.service-name{font-size:24px}.section-title{font-size:22px}.contact-details-section{padding:20px}.service-banner{padding:15px}.notes-title{font-size:17px}.notes-content{font-size:15px}}@media (max-width:480px){.service-name{font-size:20px}.section-title{font-size:18px}.method-title{font-size:17px}.notes-title{font-size:16px}.notes-content{font-size:14px}}";
        }
    }

    #endregion
}


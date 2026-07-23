using Content.Modelling.Models.Components;
using Microsoft.AspNetCore.Html;
using RazorPageYourCouncilWebsite.Helpers.Html;

namespace RazorPageYourCouncilWebsite.Helpers
{
    public static class ServiceContactHelper
    {
        // Default options for main content
        public static ServiceContactOptions DefaultOptions { get; } = new()
        {
            ServiceTypeText = "Blackpool Council Service",
            ShowOpeningHours = false,
            AdditionalInfo = "Response time: 3-5 working days",
            PhonePriority = PhoneNumberPriority.FirstNonEmpty,
            Layout = ContactLayout.Cards,
            AdditionalCssClasses = "my-service-contact"
        };

        // Options for sidebar/minimal display
        public static ServiceContactOptions SidebarOptions { get; } = new()
        {
            ShowServiceType = false,
            ShowSectionTitles = false,
            CompactMode = true,
            ContainerCssClass = "service-contact-sidebar"
        };

        // Main method - uses default options
        public static IHtmlContent Render(ServiceContact serviceContact)
        {
            return Render(serviceContact, DefaultOptions);
        }

        // Overloaded method - uses custom options
        public static IHtmlContent Render(ServiceContact serviceContact, ServiceContactOptions options)
        {
            var htmlContent = new HtmlContentBuilder();

            if (serviceContact != null)
            {
                htmlContent.AppendServiceContact(serviceContact, options ?? DefaultOptions);
            }

            return htmlContent;
        }
    }
}

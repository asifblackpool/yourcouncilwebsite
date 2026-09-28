using System;
using Xunit;
using Newtonsoft.Json;
using Content.Modelling.Models.Components;

namespace YourCouncilWebsite.UnitTests.Components
{
    /// <summary>
    /// Tests for the slimmed-down <see cref="PrivacyNoticesAccordionComponent"/>.
    /// The component is a plain CMS data carrier — Title + Label — so the
    /// only things worth testing are JSON binding and defaults.
    /// </summary>
    public class PrivacyNoticesAccordionComponentTests
    {
        [Fact]
        public void Deserialises_Title_And_Label_From_Cms_Json()
        {
            const string json = """
            {
                "title": "Our privacy notices",
                "label": "section-a"
            }
            """;

            var component = JsonConvert.DeserializeObject<PrivacyNoticesAccordionComponent>(json);

            Assert.NotNull(component);
            Assert.Equal("Our privacy notices", component!.Title);
            Assert.Equal("section-a", component.Label);
        }

        [Fact]
        public void Defaults_Are_Empty_Strings_Not_Null()
        {
            var component = new PrivacyNoticesAccordionComponent();

            Assert.Equal(string.Empty, component.Title);
            Assert.Equal(string.Empty, component.Label);
        }

        [Fact]
        public void Missing_Fields_Deserialise_To_Empty_Strings()
        {
            const string json = "{ }";

            var component = JsonConvert.DeserializeObject<PrivacyNoticesAccordionComponent>(json);

            Assert.NotNull(component);
            Assert.Equal(string.Empty, component!.Title);
            Assert.Equal(string.Empty, component.Label);
        }

        [Fact]
        public void Null_Fields_In_Json_Deserialise_To_Null()
        {
            // Newtonsoft will assign null to a nullable-agnostic string property
            // when the JSON explicitly says null. The component does not
            // re-default after binding, so consumers must null-guard.
            const string json = """
            {
                "title": null,
                "label": null
            }
            """;

            var component = JsonConvert.DeserializeObject<PrivacyNoticesAccordionComponent>(json);

            Assert.NotNull(component);
            Assert.Null(component!.Title);
            Assert.Null(component.Label);
        }
    }
}
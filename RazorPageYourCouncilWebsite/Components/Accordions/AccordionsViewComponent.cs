using Content.Modelling.Models.Templates;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc;
using RazorPageYourCouncilWebsite.Core.Models.ViewModels;
using Zengenti.Contensis.Delivery;
using Content.Modelling.Models.Accordions;
using RazorPageYourCouncilWebsite.Components.Extensions;
using System.Collections;

namespace RazorPageYourCouncilWebsite.Components.Accordions
{
    public class AccordionsViewComponent : ViewComponent
    {
        private readonly ContensisClient _contensisClient;
        private readonly ILogger<AccordionsViewComponent> _logger;

        public AccordionsViewComponent(
            ContensisClient contensisClient,
            ILogger<AccordionsViewComponent> logger)
        {
            _contensisClient = contensisClient;
            _logger = logger;
        }

        public IViewComponentResult Invoke(BGServiceLandingAccordion? model = null)
        {
            // ── DIAGNOSTIC: entry ────────────────────────────────────────────
            _logger.LogWarning("[Accordions] === Invoke start ===");
            _logger.LogWarning("[Accordions] incoming model is null: {IsNull}", model == null);

            // Try to get model from parameter first
            if (model == null)
            {
                model = ViewData["Model"] as BGServiceLandingAccordion;
                _logger.LogWarning("[Accordions] after ViewData[Model] fallback, model is null: {IsNull}", model == null);
                if (model == null && ViewBag.Model is BGServiceLandingAccordion viewBagModel)
                {
                    model = viewBagModel;
                    _logger.LogWarning("[Accordions] after ViewBag.Model fallback, model is null: {IsNull}", model == null);
                }
            }

            if (model == null)
            {
                model = ViewContext.ViewData.Model as BGServiceLandingAccordion;
                _logger.LogWarning("[Accordions] after ViewContext.ViewData.Model fallback, model is null: {IsNull}", model == null);
            }

            // ── DIAGNOSTIC: model shape ──────────────────────────────────────
            if (model == null)
            {
                _logger.LogWarning("[Accordions] model is still null — cannot render. Returning empty view model.");
                var emptyVm = new AccordionViewModels { Entries = new List<object>() };
                return View(ViewComponentExtensions.GetViewPath("Accordions"), emptyVm);
            }

            _logger.LogWarning("[Accordions] model type: {Type}", model.GetType().FullName);

            // Dump every property, with a short summary of each value.
            foreach (var prop in model.GetType().GetProperties())
            {
                try
                {
                    var val = prop.GetValue(model);
                    string summary;
                    if (val == null)
                    {
                        summary = "null";
                    }
                    else if (val is string s)
                    {
                        summary = s.Length > 80 ? s.Substring(0, 80) + "..." : s;
                    }
                    else if (val is IEnumerable enumerable)
                    {
                        int count = 0;
                        foreach (var _ in enumerable) { count++; if (count > 1000) break; }
                        summary = $"{val.GetType().Name} (count={count})";
                    }
                    else
                    {
                        summary = val.ToString() ?? "(null ToString)";
                        if (summary.Length > 80) summary = summary.Substring(0, 80) + "...";
                    }

                    _logger.LogWarning("[Accordions]   {Prop} ({PropType}) = {Summary}",
                        prop.Name, prop.PropertyType.Name, summary);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "[Accordions]   {Prop}: ERROR reading value", prop.Name);
                }
            }

            // ── DIAGNOSTIC: resolved entries ─────────────────────────────────
            List<object> resolvedEntries;
            try
            {
                resolvedEntries = model.GetResolvedEntries(
                    _contensisClient,
                    versionStatus: 1,
                    languageCode: null);

                _logger.LogWarning("[Accordions] GetResolvedEntries returned: {Count} entries",
                    resolvedEntries?.Count ?? -1);

                if (resolvedEntries != null && resolvedEntries.Count > 0)
                {
                    for (int i = 0; i < Math.Min(resolvedEntries.Count, 5); i++)
                    {
                        var e = resolvedEntries[i];
                        _logger.LogWarning("[Accordions]   [{Index}] type={Type} value={Value}",
                            i,
                            e?.GetType().FullName ?? "null",
                            Truncate(e?.ToString(), 120));
                    }
                    if (resolvedEntries.Count > 5)
                        _logger.LogWarning("[Accordions]   ... {More} more entries not shown",
                            resolvedEntries.Count - 5);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[Accordions] GetResolvedEntries threw");
                resolvedEntries = new List<object>();
            }

            var viewModel = new AccordionViewModels
            {
                Entries = resolvedEntries
            };

            // ── DIAGNOSTIC: view model / view path ───────────────────────────
            string viewPath;
            try
            {
                viewPath = ViewComponentExtensions.GetViewPath("Accordions");
                _logger.LogWarning("[Accordions] view path resolved to: {ViewPath}", viewPath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[Accordions] GetViewPath threw");
                viewPath = "~/Views/Shared/Components/Accordions/Default.cshtml";
            }

            _logger.LogWarning("[Accordions] viewModel.Entries type: {Type}, count: {Count}",
                viewModel.Entries?.GetType().FullName ?? "null",
                viewModel.Entries?.Count ?? -1);

            return View(viewPath, viewModel);
        }

        private static string? Truncate(string? s, int max)
        {
            if (s == null) return null;
            return s.Length <= max ? s : s.Substring(0, max) + "...";
        }
    }
}





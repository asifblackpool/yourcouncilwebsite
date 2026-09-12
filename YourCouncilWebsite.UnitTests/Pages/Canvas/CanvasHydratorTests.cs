using System;
using System.Threading.Tasks;
using Content.Modelling.Helpers.Canvas;
using Newtonsoft.Json.Linq;
using Xunit;

namespace YourCouncilWebsite.UnitTests.Pages.Canvas
{
    public class CanvasHydratorTests
    {
        // ─────────────────────────────────────────────────────────────────
        // IsInlineEntryStub
        // ─────────────────────────────────────────────────────────────────

        [Fact]
        public void IsInlineEntryStub_Returns_True_For_Stub_With_Id_And_No_Canvas()
        {
            var node = JObject.Parse(@"{
                ""type"": ""_inlineEntry"",
                ""value"": {
                    ""sys"": {
                        ""id"": ""11111111-1111-1111-1111-111111111111"",
                        ""contentTypeId"": ""accordions""
                    }
                }
            }");

            var result = CanvasHydrator.IsInlineEntryStub(node, out var id);

            Assert.True(result);
            Assert.Equal(Guid.Parse("11111111-1111-1111-1111-111111111111"), id);
        }

        [Fact]
        public void IsInlineEntryStub_Returns_False_When_Canvas_Already_Present()
        {
            var node = JObject.Parse(@"{
                ""type"": ""_inlineEntry"",
                ""value"": {
                    ""sys"": { ""id"": ""11111111-1111-1111-1111-111111111111"" },
                    ""canvas"": []
                }
            }");

            var result = CanvasHydrator.IsInlineEntryStub(node, out _);

            Assert.False(result);
        }

        [Fact]
        public void IsInlineEntryStub_Returns_False_For_Non_InlineEntry_Type()
        {
            var node = JObject.Parse(@"{
                ""type"": ""_paragraph"",
                ""value"": { ""sys"": { ""id"": ""11111111-1111-1111-1111-111111111111"" } }
            }");

            Assert.False(CanvasHydrator.IsInlineEntryStub(node, out _));
        }

        [Fact]
        public void IsInlineEntryStub_Returns_False_For_Invalid_Guid()
        {
            var node = JObject.Parse(@"{
                ""type"": ""_inlineEntry"",
                ""value"": { ""sys"": { ""id"": ""not-a-guid"" } }
            }");

            Assert.False(CanvasHydrator.IsInlineEntryStub(node, out _));
        }

        [Fact]
        public void IsInlineEntryStub_Returns_False_For_Missing_Value()
        {
            var node = JObject.Parse(@"{ ""type"": ""_inlineEntry"" }");
            Assert.False(CanvasHydrator.IsInlineEntryStub(node, out _));
        }

        // ─────────────────────────────────────────────────────────────────
        // FindInlineEntryIds
        // ─────────────────────────────────────────────────────────────────

        [Fact]
        public void FindInlineEntryIds_Returns_Empty_When_No_Stubs()
        {
            var root = JObject.Parse(@"{ ""type"": ""_paragraph"", ""value"": ""hi"" }");
            var ids = CanvasHydrator.FindInlineEntryIds(root);
            Assert.Empty(ids);
        }

        [Fact]
        public void FindInlineEntryIds_Deduplicates_Repeated_Ids()
        {
            var root = JArray.Parse(@"[
                { ""type"": ""_inlineEntry"", ""value"": { ""sys"": { ""id"": ""11111111-1111-1111-1111-111111111111"" } } },
                { ""type"": ""_inlineEntry"", ""value"": { ""sys"": { ""id"": ""11111111-1111-1111-1111-111111111111"" } } }
            ]");

            var ids = CanvasHydrator.FindInlineEntryIds(root);

            Assert.Single(ids);
        }

        [Fact]
        public void FindInlineEntryIds_Finds_Stubs_In_Nested_Structures()
        {
            var root = JObject.Parse(@"{
                ""canvas"": [
                    {
                        ""type"": ""_component"",
                        ""value"": {
                            ""entry"": [
                                {
                                    ""type"": ""_inlineEntry"",
                                    ""value"": { ""sys"": { ""id"": ""22222222-2222-2222-2222-222222222222"" } }
                                }
                            ]
                        }
                    }
                ]
            }");

            var ids = CanvasHydrator.FindInlineEntryIds(root);

            Assert.Single(ids);
            Assert.Contains(Guid.Parse("22222222-2222-2222-2222-222222222222"), ids);
        }

        // ─────────────────────────────────────────────────────────────────
        // HydrateAsync — happy path
        // ─────────────────────────────────────────────────────────────────

        [Fact]
        public async Task HydrateAsync_Replaces_Stub_Value_With_Resolved_Content()
        {
            var root = JObject.Parse(@"{
                ""type"": ""_inlineEntry"",
                ""value"": {
                    ""sys"": {
                        ""id"": ""11111111-1111-1111-1111-111111111111"",
                        ""contentTypeId"": ""accordions""
                    }
                }
            }");

            var resolved = JObject.Parse(@"{
                ""accordionName"": ""Claremont by-election"",
                ""canvas"": [ { ""type"": ""_paragraph"", ""value"": ""hi"" } ]
            }");

            await CanvasHydrator.HydrateAsync(root, _ => Task.FromResult<JObject?>(resolved));

            var value = (JObject)root["value"]!;
            Assert.Equal("Claremont by-election", value["accordionName"]!.ToString());
            Assert.NotNull(value["canvas"]);
            // The sys block is replaced by the resolved entry's own sys —
            // that's expected, since we overwrite the whole value object.
            Assert.Null(value["sys"]?["contentTypeId"]); // sys in resolved test JSON is absent
        }

        [Fact]
        public async Task HydrateAsync_Does_Not_Call_Resolver_For_Already_Inlined_Entry()
        {
            var root = JObject.Parse(@"{
                ""type"": ""_inlineEntry"",
                ""value"": {
                    ""sys"": { ""id"": ""11111111-1111-1111-1111-111111111111"" },
                    ""canvas"": []
                }
            }");

            var called = false;
            await CanvasHydrator.HydrateAsync(root, _ =>
            {
                called = true;
                return Task.FromResult<JObject?>(null);
            });

            Assert.False(called);
        }

        // ─────────────────────────────────────────────────────────────────
        // HydrateAsync — caching within one call
        // ─────────────────────────────────────────────────────────────────

        [Fact]
        public async Task HydrateAsync_Resolves_Same_Id_Only_Once()
        {
            var root = JArray.Parse(@"[
                { ""type"": ""_inlineEntry"", ""value"": { ""sys"": { ""id"": ""11111111-1111-1111-1111-111111111111"" } } },
                { ""type"": ""_inlineEntry"", ""value"": { ""sys"": { ""id"": ""11111111-1111-1111-1111-111111111111"" } } }
            ]");

            var callCount = 0;
            await CanvasHydrator.HydrateAsync(root, _ =>
            {
                callCount++;
                return Task.FromResult<JObject?>(JObject.Parse(@"{ ""title"": ""x"" }"));
            });

            Assert.Equal(1, callCount);
        }

        // ─────────────────────────────────────────────────────────────────
        // HydrateAsync — depth protection
        // ─────────────────────────────────────────────────────────────────

        [Fact]
        public async Task HydrateAsync_Does_Not_Recurse_When_MaxDepth_Exceeded()
        {
            // A stub that resolves to another stub, which resolves to another...
            // maxDepth should cut recursion.
            var root = JObject.Parse(@"{
                ""type"": ""_inlineEntry"",
                ""value"": { ""sys"": { ""id"": ""11111111-1111-1111-1111-111111111111"" } }
            }");

            // Each resolver call returns a payload containing the *next* stub.
            // With maxDepth: 1, only the first level should resolve.
            var nextId = 1;
            var callCount = 0;

            Task<JObject?> Resolver(Guid _)
            {
                callCount++;
                var id = Guid.Parse($"{nextId:D8}-0000-0000-0000-000000000000");
                nextId++;

                return Task.FromResult<JObject?>(JObject.Parse($@"{{
                    ""type"": ""_inlineEntry"",
                    ""value"": {{ ""sys"": {{ ""id"": ""{id}"" }} }}
                }}"));
            }

            await CanvasHydrator.HydrateAsync(root, Resolver, maxDepth: 1);

            // maxDepth 1 means: depth 0 resolves once, depth 1 walks the new subtree
            // once but does not resolve a further nested stub.
            Assert.Equal(1, callCount);
        }

        // ─────────────────────────────────────────────────────────────────
        // HydrateAsync — failure handling
        // ─────────────────────────────────────────────────────────────────

        [Fact]
        public async Task HydrateAsync_Leaves_Stub_Untouched_When_Resolver_Returns_Null()
        {
            var originalValue = @"{ ""sys"": { ""id"": ""11111111-1111-1111-1111-111111111111"" } }";
            var root = JObject.Parse($@"{{
                ""type"": ""_inlineEntry"",
                ""value"": {originalValue}
            }}");

            await CanvasHydrator.HydrateAsync(root, _ => Task.FromResult<JObject?>(null));

            // Value unchanged — safe failure mode.
            Assert.Equal("11111111-1111-1111-1111-111111111111",
                root["value"]!["sys"]!["id"]!.ToString());
        }

        [Fact]
        public async Task HydrateAsync_Does_Nothing_When_Root_Is_Null()
        {
            // Should not throw.
            await CanvasHydrator.HydrateAsync(null!, _ => Task.FromResult<JObject?>(null));
        }

        [Fact]
        public async Task HydrateAsync_Does_Nothing_When_Resolver_Is_Null()
        {
            var root = JObject.Parse(@"{ ""type"": ""_inlineEntry"" }");
            await CanvasHydrator.HydrateAsync(root, null!);
            Assert.NotNull(root);
        }

        // ─────────────────────────────────────────────────────────────────
        // HydrateAsync — multiple stubs in one tree
        // ─────────────────────────────────────────────────────────────────

        [Fact]
        public async Task HydrateAsync_Hydrates_Multiple_Distinct_Stubs()
        {
            var idA = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
            var idB = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

            var root = JArray.Parse($@"[
                {{ ""type"": ""_inlineEntry"", ""value"": {{ ""sys"": {{ ""id"": ""{idA}"" }} }} }},
                {{ ""type"": ""_inlineEntry"", ""value"": {{ ""sys"": {{ ""id"": ""{idB}"" }} }} }}
            ]");

            await CanvasHydrator.HydrateAsync(root, id =>
            {
                var title = id.ToString().StartsWith("a") ? "A" : "B";
                return Task.FromResult<JObject?>(JObject.Parse($@"{{ ""title"": ""{title}"" }}"));
            });

            Assert.Equal("A", root[0]!["value"]!["title"]!.ToString());
            Assert.Equal("B", root[1]!["value"]!["title"]!.ToString());
        }
    }
}

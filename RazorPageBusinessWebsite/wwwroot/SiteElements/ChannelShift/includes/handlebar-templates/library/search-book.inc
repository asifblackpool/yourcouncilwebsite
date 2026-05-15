<script id="search-book-pagination-template" type="text/x-handlebars-template">
    {{#compareshort apilocation "eq" "top"}}
	<h2>Results</h2>
	{{/compareshort }} {{#if apipages.length}} {{#compareshort apilocation "eq" "top"}}
	<div id="pagination" class="row">
		<div class="col-md-12"><strong>{{apirecords }} results found</strong></div>
    </div>
    {{/compareshort }}
    <div class="row">
        <div class="col-md-8 pull-left">
            <ul id="{{ apilocation }}_library_pager" class="pagination pagination-lg">
                 {{#each apipages}}
                    {{#if @first }}
                        <li><a id="{{ ../apilocation }}_prev" href="#" class="left-link library-pager-prev" style="text-decoration:none;display:none;">Prev</a></li>
                        <li><a id="{{ ../apilocation }}_first-{{ PageNumber }}-{{ FirstHitToDisplay }}-{{ LastHitToDisplay }}" href="#" class="page-link left-link" style="text-decoration:none;display:none">{{ PageNumber }}</a></li>
                        <li class="dots-left" style="display:none"><strong>...</strong></li>
                    {{/if }}
                        <li><a id="{{ ../apilocation }}_pager-{{ PageNumber }}-{{ FirstHitToDisplay }}-{{ LastHitToDisplay }}" href="#" class="page-link center-links" style="text-decoration:none;">{{ PageNumber}}</a></li>
                    {{#if @last }}
                        <li class="dots-right" style="display:none"><strong>...</strong></li>
                        <li><a id="{{ ../apilocation }}_last-{{ PageNumber }}-{{ FirstHitToDisplay }}-{{ LastHitToDisplay }}" href="#" class="page-link right-link" style="text-decoration:none;display:none">{{ PageNumber }}</a></li>
                        <li><a id="{{ ../apilocation }}_next" href="#" class="right-link library-pager-next" style="text-decoration:none;display:none">Next</a></li>
                    {{/if }}
                {{/each}}
            </ul>
        </div>
        <div class="col-md-4 pull-right mobile-hidden">
            {{#compareshort apilocation "eq" "top"}}
            <select style="margin:20px 0px;" class="catalog-results-filter">
                <option value="-1">Filter your results</option>
                <option value="Title">Title</option>
                <option value="Author">Author</option>
                <option value="Publish">Publication Date</option>
            </select>
            {{/compareshort }}
        </div>
    </div>
{{/if}}
</script>

<script id="search-book-results-template" type="text/x-handlebars-template">
    {{#if apidata}}
    <div class="row" style="padding:10px 0px 5px 0px; border-top:solid 1px silver;border-bottom:solid 1px silver; margin-bottom:20px;">
        <div class="col-md-3 col-sm-3 col-xs-6 library-block-left; clearfix zero-pad-all">
            <label class="custom-control custom-checkbox" style="position:relative; top:20px;">
                <input id="checkbox-all" type="checkbox" class="custom-control-input" value="all" onchange="">
                <span class="custom-control-indicator">&nbsp;Select All</span>
             </label>
        </div>
        <div class="col-md-3 col-sm-3 col-xs-6 pull-right clearfix zero-pad-all">
            <div class="row">
                <div class="col-xs-12 library-btn-block pull-right clearfix">
                    <button id="reserve-all-click" class="btn btn-cta reserve-all-click">Reserve</button>
                    <button id="mylist-all-click" class="btn btn-cta mylist-all-click">Add to My List</button>
                </div>

            </div>
        </div>
    </div>
{{else}}
    <br/><strong>No search results returned please alter your query</strong>
{{/if}}
{{#each apidata}}
    <div  class="row catalog-item">   
        <div class="col-md-7 col-md-push-2 col-sm-7 col-sm-push-2 col-xs-10 col-xs-push-2 zero-pad-all" style="z-index:99; margin-bottom:15px; min-height:130px;">
            <strong><a id="title-{{ titleIDField}}" class="catalog-detail-link" href="#">{{ titleField }}</a></strong><br />
            <strong>
                {{authorField}}
                {{#if iSBNField.length}}
                {{#foreach iSBNField}}
                {{ this }} {{#compare @index ">" 0}}{{#if $last}} &nbsp;{{else }},{{/if}}&nbsp;{{/compare}}
                {{/foreach}}
                {{/if}}
                <br />published {{ datePublishedField }}
            </strong>
            <br />
            {{#foreach bibliographicInfoField }}
            {{#compareshort labelField "eq" "Summary"}}<p>{{ dotdotdot textField 120 }}</p> {{/compareshort}}
            {{/foreach}}
        </div>
        <div class="col-md-2 col-md-pull-7 col-sm-2 col-sm-pull-7 col-xs-2 col-xs-pull-10 library-block-left" style="z-index:99;">
            <label class="custom-control custom-checkbox">
                <input id="checkbox_{{ titleIDField}}" type="checkbox" class="custom-control-input" value="{{ titleIDField }}" onchange="">
                <span class="custom-control-indicator"></span>
            </label>
            {{#compareshort (getPropertyValueField bibliographicInfoField "labelField"  "Electronic access" "urlField") "eq" ""}}
            {{#if iSBNField.length}}
                <img src='{{buildLibrarySrc iSBNField.[0] }}' alt="{{ titleField  }}" class="search-image"  />
            {{/if}}
            {{ else }}
            <img src='{{ getPropertyValueField bibliographicInfoField "labelField" "Electronic access" "urlField" }}' alt="{{  titleField }}" class="search-image" />
            {{/compareshort}}
        </div>
        <div class="col-md-3 col-sm-12 library-block-right library-search-btns">
            <div class="row">
                <div class="col-xs-12 library-btn-block" >
                    <button id="reserve-{{ titleIDField }}" class="btn btn-block btn-cta reserve-click">Reserve</button>
                </div>
                <div class="col-xs-12 library-btn-block">
                    <button id="mylist-{{ titleIDField }}"  class="btn btn-block btn-cta mylist-click">Add to My List</button>
                </div>
            </div>
        </div>
    </div>
{{/each}}
<hr style="border-top: 1px solid silver;" />
</script>

<script id="availability-catalog-template" type="text/x-handlebars-template">
    <h2 style="margin-top:0px;">Results</h2>
{{#if apidata}}
<br/>
<div id="bookdetail-{{ apidata.titleIDField}}" class="clearfix" >
    <div class="row catalog-item" >
        <div class="col-md-7 col-md-push-2 col-sm-7 col-sm-push-2 col-xs-9 col-xs-push-3 zero-pad-all" style="margin-bottom:15px;">
            <strong>{{ apidata.titleField }}</strong><br />
            {{#if apidata.authorField.length}}<strong>{{ apidata.authorField}}</strong><br />{{/if}}
            ISBN:<i>
                {{#if apidata.iSBNField.length}}
                {{#foreach apidata.iSBNField}}
                {{ this }} {{#compare @index ">" 0}}{{#if $last}} &nbsp;{{else }},{{/if}}&nbsp;{{/compare}}
                {{/foreach}}
                {{/if}}
            </i><br />published <i> {{ apidata.datePublishedField }} by {{ apidata.publisherNameField}}</i>
            {{#if apidata.callSummaryField}}
            <br />libraries <i> {{ apidata.callSummaryField.[0].heldAtLibrariesDisplayField }} </i><br/>
            {{/if}}
            {{{ biblographySearch apidata.bibliographicInfoField "Summary" false }}}
            {{{ biblographySearch apidata.bibliographicInfoField "General Note" true }}}

        </div>
        <div class="col-md-2 col-md-pull-7 col-sm-2 col-sm-pull-7 col-xs-2 col-xs-pull-9 zero-pad-all">
            <input id="hidden-availability-{{ apidata.titleIDField }}" type="hidden" class="custom-control-input" value="{{ apidata.titleIDField }}" />
            {{#compareshort (getPropertyValueField apidata.bibliographicInfoField "labelField"  "Electronic access" "urlField") "eq" ""}}
            {{#if apidata.iSBNField.length}}
            <img src='{{buildLibrarySrc apidata.iSBNField.[0] }}' alt="{{ apidata.titleField  }}" class="search-image-single" onload="newbookscallbacks.replaceImage(this);" />
            {{/if}}
            {{ else }}
            <img src='{{ getPropertyValueField apidata.bibliographicInfoField "labelField" "Electronic access" "urlField" }}' alt="{{ titleField }}" class="search-image-single" />
            {{/compareshort}}
        </div>
        <div class="col-md-3 col-sm-12 library-block-right library-search-btns">
            <div class="row">
                <div class="col-xs-12 library-btn-block"><button id="back-to-search" class="btn btn-block btn-red" >Back to Search</button></div>
                <div class="col-xs-12 library-btn-block"><button id="reserve-item-{{ apidata.titleIDField }}" class="btn btn-block btn-cta reserve-item-click">Reserve</button></div>
                <div class="col-xs-12 library-btn-block"><button id="mylist-item-{{ apidata.titleIDField  }}" class="btn btn-block btn-cta mylist-item-click">Add to My List</button></div>
            </div>
        </div>
    </div>
    <!-- add availability table data below -->
    {{#if apidata.callInfoField  }}
     {{> availability-information-partial apidata }}
    {{/if}}
</div>
{{/if}}
</script>

<script id="availability-information-partial" type="text/x-handlebars-template">
    <div class="row library-banner  clearfix">
            <div class="col-md-8 col-sm-8 library-block-left">
                <strong>Available:</strong>&nbsp;{{ titleAvailabilityInfoField.totalCopiesAvailableField}}
            </div>
            <div class="col-md-4 col-sm-8 library-block-right">&nbsp;</div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <table class="tbl-responsive">
                    <tbody>
                        <tr>
                            <th>Library&nbsp;</th>
                            <th>Material Types&nbsp;</th>
                            <th>Item Barcode&nbsp;</th>
                            <th>Shelf Number</th>
                            <th>Status</th>
                        </tr>
                            
                            {{#each callInfoField}}
                               <tr>
                                <td><span class="mobile-title"><strong>Library:</strong></span>{{  getLibraryName libraryIDField }}</td>
                                <td><span class="mobile-title"><strong>Type:</strong></span>{{ itemInfoField.[0].itemTypeIDField   }}</td>
                                <td><span class="mobile-title"><strong>Barcode:</strong></span>{{  itemInfoField.[0].itemIDField }}</td>
                                <td><span class="mobile-title"><strong>Shelf Nu:</strong></span>{{ callNumberField }}</td>
                                <td> <span class="mobile-title"><strong>Status:</strong></span> {{itemStatus this @index}}</td>
                               </tr>
                            {{/each}}        
                        
                    </tbody>
                </table>

            </div>
        </div>
</script>

<script id="pickup-location-template" type="text/x-handlebars-template">

    <h2 style="margin-top:0px;">{{ apiview.title }}</h2>
    <div class="row library-banner clearfix">
        <div class="col-md-12 col-sm-12 library-block-left">
            <strong>Place holds(s) - </strong>a charge may apply
        </div>
    </div>
    <table class="tbl-responsive">
        <tbody>
            <tr>
                <th>Title&nbsp;</th>
                <th>Pickup Library&nbsp;</th>
                <th>Volume&nbsp;</th>
            </tr>
            {{#greaterthanlimit apidata.length 1}}
            {{#each ../apidata }}
            <tr>
                <td><span>{{ titleField }}</span></td>
                <td>
                    <span class="mobile-title"><strong>Library:</strong></span>
                    <select id="library-pickup-{{ titleIDField }}" class="library-ddl" style="float:left;">
                        <option value="ANC">Anchorsholme</option>
                        <option value="CEN" selected="selected">Central</option>
                        <option value="LNG">Langdale Library</option>
                        <option value="LAY">Layton</option>
                        <option value="GRA">Library @thegrange</option>
                        <option value="MOR">Moor Park</option> 
                        <option value="PAL">Palatine</option>
                        <option value="REV">Revoe</option
                    </select>
                </td>
                <td><span class="mobile-title"><strong>Volume:</strong></span>2</td>
            </tr>
            {{/each}}
            {{else}}
            {{#each ../apidata }}
            <tr>
                <td><span>{{ titleField }}</span></td>
                <td>
                    <span class="mobile-title" style="width:95%; text-align:center;"><strong>Pickup Library:</strong></span>
                      <div class="radio radio-info">
                        <input type="radio" name="optradio" value="ANC" />
                        <label>Anchorsholme</label>
                    </div>
                     <div class="radio radio-info">
                        <input type="radio" name="optradio" value="CEN" />
                        <label>Central</label>
                    </div>
                       <div class="radio radio-info">
                        <input type="radio" name="optradio" value="LNG" />
                        <label>Langdale</label>
                    </div>
                    <div class="radio radio-info">
                        <input type="radio" name="optradio" value="LAY" />
                        <label>Layton</label>
                    </div>
                     <div class="radio radio-info">
                        <input type="radio" name="optradio" value="GRA" />
                        <label>Library @thegrange</label>
                    </div>
                    <div class="radio radio-info">
                        <input type="radio" name="optradio" value="MOR" />
                        <label>Moor Park</label>
                    </div>
                    <div class="radio radio-info">
                        <input type="radio" name="optradio" value="PAL" />
                        <label>Palatine</label>
                    </div>
                       <div class="radio radio-info">
                        <input type="radio" name="optradio" value="REV" />
                        <label>Revoe</label>
                    </div>
                   
                </td>
                <td><span class="mobile-title"><strong>Volume:</strong></span>2</td>
            </tr>
            {{/each}}
            {{/greaterthanlimit}}
        </tbody>
    </table>
    <div class="row library-padding">
        <div class="col-sm-3 col-xs-6 zero-pad-all" ><button id="pickuplocation-back-to" class="btn btn-block btn-red">Back</button></div>
        <div class="col-sm-3 col-xs-6 zero-pad-right" ><button id="location-reserve" class=" btn btn-block btn-cta">Reserve</button></div>
    </div>
    <input id="backtoview" type="hidden" value="{{ apiview.page }}">
    <input id="pickuplocationview" type="hidden" value="{{pickuplocationView apidata }}"> 
</script>

<script id="advanced-search-template" type="text/x-handlebars-template">
    <h2>Advanced search</h2>
    <strong>Find items that have:</strong>
    <div class="row" style="padding:10px;">
        <div class="col-md-5 col-sm-5 col-xs-12">
            <label class="radio-inline"><input type="radio" name="advOptRadio" value="ALL" style="position:relative;margin-right:5px;">All these words</label>
            <label class="radio-inline"><input type="radio" name="advOptRadio" checked="checked" value="EXACT" style="position:relative;margin-right:5px;">This exact phrase&nbsp;&nbsp;</label>
        </div>
        <div class="col-md-6 col-sm-6">
            <input id="term1" type="text" class="form-control form-text" />
        </div>
    </div>
    <strong>Dont show items that have:</strong>
    <div class="row" style="padding:10px;">
        <div class="col-md-5 col-sm-5">
            <span class="">These unwanted terms:</span>
        </div>
        <div class="col-md-6 col-sm-6">
            <input id="term2" type="text" class="form-control form-text" />
        </div>
    </div>
    <strong>Additional limits:</strong>
    <div class="row" style="padding:10px;">
        <div class="col-md-5 col-sm-5">
            <span class="">Format Type:</span>
        </div>
        <div class="col-md-6 col-sm-6">
            <select id="formt-type-ddl" class="form-control">
                <option value="">Any Format</option>
                <option value="ATLAS">Atlas</option>
                <option value="SOUNDCASS">Audio cassette</option>
                <option value="SOUNDDISC">Audio disc</option>
                <option value="BOOK">Book</option>
                <option value="CR">Continuing Resources</option>
                <option value="ER">Electronic Resources</option>
                <option value="KIT">Kit</option>
                <option value="LARGEPRINT">Large print</option>
                <option value="MS">Manuscript</option>
                <option value="MAP">Maps</option>
                <option value="MICROFORM">Microform</option>
                <option value="MUSIC">Music</option>
                <option value="MUSICSNDREC">Music Sound Recording</option>
                <option value="NOTATEDMUSIC">Notated music</option>
                <option value="REGPRINT">Regular print</option>
                <option value="SOUNDREC">Sound recording</option>
                <option value="UNSPECIFIED">Unspecified</option>
                <option value="VISUAL">Visual Materials</option>
            </select>
        </div>
    </div>
    <div class="row" style="padding:10px;">
        <div class="col-md-5 col-sm-5">
            <span class="">Language:</span>
        </div>
        <div class="col-md-6 col-sm-6">
            <select id="language-ddl" class="form-control">
                <option value="">Any Language</option>
                <option value="ARA">Arabic</option>
                <option value="BEN">Bengali</option>
                <option value="CHI">Chinese</option>
                <option value="DUT">Dutch</option>
                <option value="ENG">English</option>
                <option value="FRE">French</option>
                <option value="GLA">Gaelic (Scots)</option>
                <option value="GER">German</option>
                <option value="HIN">Hindi</option>
                <option value="ITA">Italian</option>
                <option value="JAP">JAP</option>
                <option value="LAT">Latin</option>
                <option value="MAN">Mandingo</option>
                <option value="MUL">Multiple languages</option>
                <option value="NOR">Norwegian</option>
                <option value="POL">Polish</option>
                <option value="POR">Portuguese</option>
                <option value="RUM">Romanian</option>
                <option value="RUS">Russian</option>
                <option value="SCO">Scots</option>
                <option value="SPA">Spanish</option>
                <option value="SWE">Swedish</option>
                <option value="TUR">Turkish</option>
                <option value="UND">Undetermined</option>
                <option value="URD">Urdu</option>
                <option value="WEL">Welsh</option>
            </select>
        </div>
    </div>
    <div class="row" style="padding:10px;">
        <div class="col-md-5 col-sm-5">
            <span class="">Library:</span>
        </div>
        <div class="col-md-6 col-sm-6">
            <select id="library-ddl" class="form-control">
                <option value="">Any Library</option>
                <option value="ANC">Anchorsholme Library</option>
                <option value="HOM">At Home Library Service Library</option>
                <option value="CEN">Central Library</option>
                <option value="LNG">Langdale Library</option>
                <option value="LAY">Layton Library</option>
                <option value="GRA">Library @thegrange</option>
                <option value="MOR">Moor Park Library</option>
                <option value="PAL">Palatine Library</option>
                <option value="REV">Revoe Library</option>
            </select>
        </div>
    </div>
    <div class="row" style="padding:10px;">
        <div class="col-sm-offset-2 col-sm-10">
            <label style="font-weight:normal;"><input id="chkbox-showavailableonly" type="checkbox" class="library-available">&nbsp;&nbsp;Only show available</label>
        </div>
    </div>
    <div class="row" style="padding:10px;">
      

        <div class="adv-search-input-readonly col-md-6 col-sm-6 col-xs-12">
            <input id="library-result" type="text" class="form-control form-text" readonly="readonly" />
        </div>
        <div class="col-md-3 col-xs-12">
            <button id="back-to-search" class="btn btn-block btn-red">Back to Search</button>
        </div>
        <div class="col-md-3 col-sm-3 col-xs-12">
            <button id="library-advanced-search-submit" type="submit" class="btn btn-block btn-cta">Search Now</button>
        </div>
    </div>
    <div class="row library-padding">
        </div>
</script>

<script id="whats-new-template" type="text/x-handlebars-template">

    <h2><strong>What's new</strong></h2>
 {{#if apidata}}
    <div class="row hotlist-container">
        <div class="col-md-7 col-md-push-2 col-sm-10 col-sm-push-2 col-xs-8 col-xs-push-2" style="z-index:99; margin-bottom:10px;">
            <strong><a id="title-{{ apidata.titleIDField}}" class="hotlist-detail-link" href="#">{{ apidata.titleField }}</a></strong><br />
            {{#if apidata.authorField.length}}<strong>{{ apidata.authorField}}</strong><br />{{/if}}
            ISBN:<i>
                {{#if apidata.iSBNField.length}}
                {{#foreach apidata.iSBNField}}
                {{ this }} {{#compare @index ">" 0}}{{#if $last}} &nbsp;{{else }},{{/if}}&nbsp;{{/compare}}
                {{/foreach}}
                {{/if}}
            </i><br />published <i> {{ apidata.datePublishedField }} </i>
            {{{ biblographySearchLimit apidata.bibliographicInfoField "Summary" 120 }}}
        </div>
        <div class="col-md-2 col-md-pull-7 col-sm-2 col-sm-pull-10 col-xs-2 col-xs-pull-8 library-block-left clearfix" style="margin-bottom:10px;">
            <div style="float:left;min-width:140px; display:table-cell;">
                {{#if apidata.iSBNField.length}}
                <img src='{{buildLibrarySrc apidata.iSBNField.[0] }}' alt="{{ apidata.titleField  }}" style="max-height:120px; max-width:90px; margin-left:10px;" onload="newbookscallbacks.replaceImage(this);" />
                {{/if}}
            </div>
        </div>
        <div class="col-md-3 col-sm-12 library-block-right clearfix">
            <button id="hotlist-reserve-{{ apidata.titleIDField }}" type="button" class="hotlist-reserve btn btn-block btn-cta" >&nbsp;&nbsp;Reserve&nbsp;&nbsp;</button>
            <button id="hotlist-addmylist-{{ apidata.titleIDField }}" type="button" class="hotlist-mylist btn btn-block btn-cta" >Add to my list</button>
        </div>
    </div>
 {{/if}}
 {{#if apilist}}
    <hr />
    <div class="row" style="display:table;width:100%;">
        {{#each apilist}}
        <div class="hotlist-div">
            <a id="hotlist-{{ @index }}" href="#" class="hotlist-link"><img src="{{ buildLibrarySrc iSBNField.[0] }}" alt="{{ titleField }}"  onload="newbookscallbacks.replaceImage(this);" /></a>
        </div>
        {{/each }}
    </div>
    {{/if}}
</script>

<script id="nyt-whats-new-template" type="text/x-handlebars-template">
    {{#if apidata}}
    <h2><strong>What's new</strong></h2>
    <div class="row">
        <div class="col-md-7 col-md-push-2 col-sm-7 col-sm-push-2">
            <strong>title field</strong><br />
            <strong>description to go here</strong><br />
            blah blah blah blah blah blah blah blah blah blah blah blah blarh ...<br />
        </div>
        <div class="col-md-2 col-md-pull-7 col-sm-2 col-sm-pull-7 library-block-left" style="margin-bottom:10px;">
            <div style="float:left;min-width:140px; display:table-cell;">
                <img src='/siteElements/channelshift/content/images/library/war-and-peace.jpg' alt="test desc" style="max-height:120px; max-width:90px; margin-left:20px;" />
            </div>

        </div>
        <div class="col-md-3 col-sm-12 library-block-right clearfix">
            <button id="reserve" type="button" class="btn btn-block btn-info" >&nbsp;&nbsp;Reserve&nbsp;&nbsp;</button>
            <button class="btn btn-block btn-info" >Add to Mylist</button>
        </div>
    </div>
    <hr />
    <div class="row" style="display:table;width:100%;">
        {{#each apidata}}
        <div style="display:table-cell; width:20%;">
            <a id="isbn_{{ selectIsbn  book_details.0.primary_isbn13 book_details.0.primary_isbn10 }}" href="#" class="nytimes-link"><img src="{{ buildLibrarySrc (selectIsbn  book_details.0.primary_isbn13 book_details.0.primary_isbn10 ) }}" alt="{{ book_details.[0].title }}" style="max-width:140px; margin:auto; text-align:center; display:block;" /></a>
        </div>
        {{/each }}
    </div>
{{/if}}
</script>
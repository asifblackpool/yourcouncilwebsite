<script id="webcast-agenda-template" type="text/x-handlebars-template">
    <br/>
    <h1>{{apidata.status}} {{ apidata.date_description }}</h1>
    <div class="accordion clearfix">
     <ul id="accordion-ul" class="outer-ul">
         <li class="head">
             <a href="#"><h2 class="clearfix"><span class="pull-left">Agenda</span><span class="pull-right"><i title="Open or close" class="icon-arrow-down"></i></span></h2></a>
             <div class="accordion-togglable" style="display: none;">
                 <div class="row">
                     <div class="col-md-12 col-sm-12 col-xs-12 zero-pad-all">
                         {{#if this.apidata}}
                         <div class="mgSubTitle">
                             <h2 class="mgSubTitleTxt" style="margin-top:-15px;">
                                 <a href="mgCommitteeDetails.aspx?ID=134" title="Link to Council">
                                     {{ apidata.status }}<br>{{ apidata.date_description }} {{ apidata.startTime}}
                                 </a>
                             </h2>
                         </div>
                         <div class="mgContent">
                             <p><span class="mgLabel">Venue: </span>{{ apidata.location }}</p>
                             <p><span class="mgLabel">Contact: </span>Yvonne Burnett&nbsp;Democratic Services Projects Officer</p>
                             <p><span class="mgLabel">Webcast: </span><a href="#" title="View the webcast">View the webcast</a> </p>
                         </div>

                         {{#each this.apiagendas}}
                         <table class="mgItemTable" summary="Table of agenda items" id="mgItemTable">
                             <caption class="mgSectionTitle">Items</caption>
                             <tbody>
                                 <tr>
                                     <td class="mgItemNumberCell"><p class="mgAiTitleTxt">{{ agendaitemnumber }}.</p></td>
                                     <td>
                                         <p class="mgAiTitleTxt">
                                             {{#if this.linkeddocuments}}
                                             {{> documents-partial this}}
                                             {{else }}
                                             {{ agendaitemtitle}}
                                             {{/if}}
                                         </p>
                                         <div class="mgWordPara">{{{ agendatext}}}</div>
                                         <p class="mgSubItemTitleTxt">Additional documents:</p>
                                         <ul class="mgBulletList">
                                             <li><a href="#" title="Link to webcast for  item {{ agendaitemnumber }}.">Webcast for {{ agendaitemnumber }}.</a></li>
                                             {{#if this.linkeddocuments}}
                                             {{> documents-list-partial this}}
                                             {{/if}}
                                         </ul>
                                         {{#if minutesnonemptyhtmlbody.length}}
                                         <p class="mgSubItemTitleTxt">Minutes:</p>
                                         <div class="mgWordPara">{{{minutesnonemptyhtmlbody}}}</div>
                                         {{/if}}
                                     </td>
                                 </tr>
                             </tbody>
                         </table>
                         {{/each }}
                         {{else}}
                         <p><strong>Sorry we cannot find agenda details </strong></p>
                         {{/if}}
                     </div>
                     </div>
               </div>
          </li>
         <li class="head">
             <a href="#"><h2 class="clearfix"><span class="pull-left">Attendance</span><span class="pull-right"><i title="Open or close" class="icon-arrow-down"></i></span></h2></a>
             <div class="accordion-togglable" style="display: none;">
                 <div class="row">
                     <div class="col-md-12 col-sm-12 col-xs-12 zero-pad-all">
                         <h2>Meeting attendance</h2>
                         <div>
                             <table id="meeting-attendance" class="display" cellspacing="0" width="100%">
                                 <thead>
                                     <tr>
                                         <th>Id</th>
                                         <th>Name</th>
                                         <th>Role</th>
                                         <th>Attendance</th>  
                                     </tr>
                                 </thead>
                             </table>
                         </div>
                     </div>
                 </div>
            </div>
         </li>
     </ul>
 </div>
</script>

<script id="documents-partial" type="text/x-handlebars-template">
{{#foreach this.linkeddocuments.linkeddoc}}
  {{#if $first}}
    {{{ link title url class='mgAiTitleLnk' title=(concat (concat 'link to ' title) ' pdf title') }}}
      <span class="mgFileSize">
         <img height="12" src="/SiteElements/channelshift/content/images/logo-pdf-1.gif" width="12" alt="pdf icon"> PDF
      </span>
  {{/if}}
{{/foreach}}
</script>

<script id="documents-list-partial" type="text/x-handlebars-template">
{{#foreach this.linkeddocuments.linkeddoc}}
  {{#compare $index ">" 0}}
    <li>
        {{{ link title url class='mgAiTitleLnk' title=(concat (concat 'link to ' title) ' pdf title') }}}
        <span class="mgFileSize">
            <img height="12" src="/SiteElements/channelshift/content/images/logo-pdf-1.gif" width="12" alt="pdf icon"> PDF
        </span>
    </li>
  {{/compare}}
{{/foreach}}
</script>



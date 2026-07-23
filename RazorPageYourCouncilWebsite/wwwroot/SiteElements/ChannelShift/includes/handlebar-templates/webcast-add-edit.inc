<script id="webcast-add-edit-template" type="text/x-handlebars-template">
  
            <div class="form-group">
                <label class="col-md-3 control-label">Video Title</label>
                <div class="col-md-6">
                    <input type="text" class="form-control" id="VideoTitle" name="VideoTitle" value="{{ apidata.Title }}" placeholder="Video Title" maxlength="200" />
                </div>
            </div>
            <div class="form-group">
                <label class="col-md-3 control-label">Video Key</label>
                <div class="col-md-6">
                    <input type="text" class="form-control" id="VideoKey" name="VideoKey" value="{{ apidata.VideoKey }}" placeholder="Video Key" maxlength="16" />
                </div>
            </div>
            <div class="form-group">
                <label class="col-md-3 control-label">Start Date and Time</label>
                <div class="col-md-6">
                    <div class="input-group input-append date">
                        <input type="text" class="form-control " name="StartDateTime" id="StartDateTime" placeholder="date time calendar" />
                        <span class="input-group-addon add-on"><span class="glyphicon glyphicon-calendar"></span></span>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label class="col-md-3 control-label">Member Id</label>
                <div class="col-md-6">
                    <input type="text" class="form-control" id="MemberId" name="MemberId" placeholder="Enter your associated Member Id " value="{{ apidata.DemocracyMeetingId }}" maxlength="4" />
                </div>
            </div>
            <div class="form-group">
                <label class="col-md-3 control-label">IsActive</label>
                <div class="col-md-6">
                    <div class="radio">
                        <label class="radio-inline"><input type="radio" name="inlineRadioOptions" id="inlineRadio1" value="1" {{{ setRadio 1 apidata.IsActive }}} /> True </label>
                    </div>
                    <div class="radio">
                        <label class="radio-inline"><input type="radio" name="inlineRadioOptions" id="inlineRadio2" value="0" {{{ setRadio 0 apidata.IsActive }}} /> False</label>
                    </div>
                </div>
            </div>

            <div class="form-group">
                <div class="col-md-9 col-md-offset-3">
                    <button id="submit-webcast" type="submit" class="btn btn-default">Save</button>
                </div>
            </div>
            <input id="videoId" name="videoId" value="0" type="hidden" />
</script>

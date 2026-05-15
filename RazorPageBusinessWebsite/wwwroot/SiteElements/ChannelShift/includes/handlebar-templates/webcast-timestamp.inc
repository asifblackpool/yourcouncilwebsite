<script id="webcast-timestamp-template" type="text/x-handlebars-template">

    <div class="form-group">
        <label class="col-md-3 control-label">Title</label>
        <div class="col-md-6">
            <input type="text" class="form-control" id="Title" name="Title" value="{{ apidata.Title }}" placeholder="Timestamp Title" maxlength="200" />
        </div>
    </div>

    <div class="form-group">
        <label class="col-md-3 control-label">Time</label>
        <div class="col-md-6">
            <div class="input-group input-append date">
                <input type="text" class="form-control " name="Time" id="Time" placeholder="enter you  time" />
                <span class="input-group-addon add-on"><span class="glyphicon glyphicon-calendar"></span></span>
            </div>
        </div>
    </div>
    <input id="timestamp-mode" name="timestamp-mode" value="{{ apimode}}" type="hidden" />
    <input id="timestamp-Id" name="timestamp-Id" value="{{ apidata.Id}}" type="hidden" />
    <input id="timestamp-videoId" name="timestamp-videoId" value="{{ apidata.VideoId}}" type="hidden" />
</script>

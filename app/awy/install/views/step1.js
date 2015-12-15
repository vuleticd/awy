let str = `
<form id="gr" method="post" action="VIEW{href("install/step1")}" class="form-horizontal">
    <div class="panel-heading">
        <h1 class="panel-title">Step 1 of 3: Database Connection</h1>
    </div>
    <div class="form-group">
    	<label class="required" for="host">Firebase DB URL</label>
    	<div class="text-input">
    		<input type="text" class="required" name="host" />
    	</div>
    </div>
    <div class="form-group">
    	<label class="required" for="key">Secure Key</label>
    	<div class="text-input">
    		<input type="text" class="required" name="key" />
    	</div>
    </div>
    <ul class="list-group list-group-flush">
        <li class="list-group-item clearfix">
            <a class="btn btn-link pull-left" name="do" value="back" href="VIEW{href("install")}"> Back</a>
            <button type="submit" class="btn btn-primary pull-right" name="do" value="next">Continue</button>
        </li>
    </ul>
</form>
`;
export default str;
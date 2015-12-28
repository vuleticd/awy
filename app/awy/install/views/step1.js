let str = `
    <div class="panel-heading">
        <h1 class="panel-title">Step 1 of 3: Database Connection</h1>
    </div>
    <div class="form-group">
    	<label class="required" for="host">Firebase DB URL</label>
    	<div class="text-input">
    		<input type="text" class="required" name="host" data-bind="value db_url"/>
    	</div>
    </div>
    <div class="form-group">
    	<label class="required" for="key">Secure Key</label>
    	<div class="text-input">
    		<input type="text" class="required" name="key" data-bind="value db_key"/>
    	</div>
    </div>
    <ul class="list-group list-group-flush">
        <li class="list-group-item clearfix">
            <button type="submit" class="btn btn-primary pull-right" name="do" value="next" data-bind="click completeStep">Continue</button>
        </li>
    </ul>
</form>
`;
export default str;
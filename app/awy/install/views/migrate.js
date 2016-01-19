let str = `
    <div class="row errors">
        <ul class="fa-ul" data-bind="text errors"></ul>
    </div>
    <div class="row">
        <ul class="fa-ul" data-bind="text migrations"></ul>
    </div>
    <div class="row">
        <h1>Step 1 of 3: Database Connection</h1>
    </div>
    <div class="row">
    	<div class="six columns">
            <label class="required" for="host">Firebase DB URL</label>
    		<input type="text" class="required u-full-width" name="host" data-bind="value db_url" placeholder="https://torrid-heat-5927.firebaseio.com"/>
    	</div>
    </div>
    <div class="row">
    	<div class="six columns">
            <label class="required" for="key">Secure Key</label>
    		<input type="text" class="required u-full-width" name="key" data-bind="value db_key" placeholder="HkAgAjx75eRzC4sLqzV1HVw4rPmEFqqcTQcUSAt0"/>
    	</div>
    </div>
    <div class="row">
        <div class="three columns">
            <button type="submit" class="button-primary" data-bind="click execute">Run</button>
        </div>
    </div>
`;
export default str;
let str = `
	<div class="row errors">
        <ul class="fa-ul" data-bind="text errors"></ul>
    </div>
	<div class="row">
	    <h1>Step 3 of 3: Initial Configuration</h1>
	</div>
	<div data-hook="after_form_fields" />
	<div class="row">
        <div class="three columns">
            <button type="submit" class="button-primary" data-bind="click completeStep">Finish</button>
        </div>
    </div>
`;
export default str;
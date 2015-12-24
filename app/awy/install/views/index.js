//let str = 'form[method="POST" action="install" class="form-horizontal"]>div.panel-heading>h1.panel-title>{Welcome to Awy installation wizard!}';
let str = `
<div class="panel-heading">
	<h1 class="panel-title">Welcome to Awy installation wizard!</h1>
</div>
<div class="well" style="max-height:300px; overflow-y:auto">
	<h3>Open Software License v. 3.0 (OSL-3.0)</h3>
</div>
<div class="clearfix">
	<div class="checkbox pull-right">
		<label class="required"><input data-bind="checked agree" type="checkbox" name="w[agree]" value="Agree" required="required"/> I agree</label>
	</div>
</div>
<ul class="list-group list-group-flush">
	<li class="list-group-item clearfix">
		<a data-bind="click completeStep">Continue</a>
	</li>
</ul>
`;

export default str;
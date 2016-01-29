let str = `
<div class="login-container">
	<div class="row errors">
		<ul class="fa-ul" data-bind="text errors"></ul>
	</div>
	<div class="row">
		<h1>Recover password</h1>
	</div>
	<div class="row">
    	<div class="u-full-width">
            <label class="required" for="email">E-mail</label>
    		<input type="text" class="required u-full-width" name="email" data-bind="value email" placeholder=""/>
    	</div>
    </div>
    <div class="row">
        <div class="one-half column u-pull-left">
        	<button type="button" class="button u-pull-left" data-bind="click back">Back to Login</button>
        </div>
        <div class="one-half column u-pull-right">
            <button type="button" class="button-primary long-text-button u-pull-right" data-bind="click resetPassword">Send me the instructions</button>
        </div>
    </div>
</div>
`;
export default str;
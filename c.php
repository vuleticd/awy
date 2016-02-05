<?php
if(!empty($_POST['data'])){
	$data = "
let global = {
	db: {
		host: " . $_POST['data'] . ",
	}
}

export default global;
	";
	@file_put_contents("app/db.js", $data);
}

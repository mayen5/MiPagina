<?php

$siteOwnersEmail = 'carmelo5mayen@gmail.com';

// Removes CR/LF and null bytes to prevent email header injection
function sanitize_header($value) {
   return str_replace(["\r", "\n", "\0"], '', $value);
}

if($_POST) {

   $name    = sanitize_header(trim(stripslashes($_POST['contactName'])));
   $email   = sanitize_header(trim(stripslashes($_POST['contactEmail'])));
   $subject = sanitize_header(trim(stripslashes($_POST['contactSubject'])));
   $contact_message = trim(stripslashes($_POST['contactMessage']));

   // Check Name
	if (strlen($name) < 2) {
		$error['name'] = "Por favor ingresa tu nombre.";
	}
	// Check Email
	if (!preg_match('/^[a-z0-9&\'\.\-_\+]+@[a-z0-9\-]+\.([a-z0-9\-]+\.)*+[a-z]{2}/is', $email)) {
		$error['email'] = "Por favor ingresa un correo electrónico válido.";
	}
	// Check Message
	if (strlen($contact_message) < 15) {
		$error['message'] = "Por favor ingresa tu mensaje (mínimo 15 caracteres).";
	}
   // Subject
	if ($subject == '') { $subject = "Mensaje desde formulario de contacto"; }


   // Set Message
   $message  = "Email from: " . htmlspecialchars($name) . "<br />";
	$message .= "Email address: " . htmlspecialchars($email) . "<br />";
   $message .= "Message: <br />";
   $message .= nl2br(htmlspecialchars($contact_message));
   $message .= "<br /> ----- <br /> Este mensaje fue enviado desde el formulario de contacto. <br />";

   // Set From: header — use site address to avoid spoofing rejections
   $from = $siteOwnersEmail;

   // Email Headers
	$headers  = "From: " . $from . "\r\n";
	$headers .= "Reply-To: " . $email . "\r\n";
 	$headers .= "MIME-Version: 1.0\r\n";
	$headers .= "Content-Type: text/html; charset=UTF-8\r\n";


   if (!$error) {

      ini_set("sendmail_from", $siteOwnersEmail); // for windows server
      $mail = mail($siteOwnersEmail, $subject, $message, $headers);

		if ($mail) { echo "OK"; }
      else { echo "Something went wrong. Please try again."; }
		
	} # end if - no validation error

	else {

		$response = (isset($error['name'])) ? $error['name'] . "<br /> \n" : null;
		$response .= (isset($error['email'])) ? $error['email'] . "<br /> \n" : null;
		$response .= (isset($error['message'])) ? $error['message'] . "<br />" : null;
		
		echo $response;

	} # end if - there was a validation error

}

?>
function loginAsTestUser()
{
	document.getElementById("username").value = "test";
	document.getElementById("userPassword").value = "password";
	document.getElementById("login-button").click();
}
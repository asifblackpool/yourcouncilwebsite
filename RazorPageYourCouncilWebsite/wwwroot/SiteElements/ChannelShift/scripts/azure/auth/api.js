function callApi(endpoint, username, account,token, callback) {

    const headers = new Headers();
    const bearer = `Bearer ${token}`;

    endpoint = endpoint + username + "/";

    headers.append("Access-Control-Allow-Credentials", true);
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append("Access-Control-Allow-Methods", "GET");
    headers.append("Authorization", bearer);
 


  
    const options = {
        method: "GET",
        headers: headers,
        //dataType: "jsonp",
        //crossDomain: true,
        //xhrFields: { 'withCredentials': true },
        //mode:"no-cors"
      };
  
    logMessage('Calling SSO Web API...');
    ssoservices.init(apiConfig, token);
    
    fetch(endpoint, options)
      .then(response => response.json())
      .then(response => {

          if (response) {
      
              callback(true, response);
        }
        return response;
      }).catch(error => {
          console.error(error);
          return callback(false, null);
      });
}



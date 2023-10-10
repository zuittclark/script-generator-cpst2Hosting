
export const uploadScriptToCloud = (codeText, setIsHidden, setIsLoadingButton) => {
    
    setIsLoadingButton(true);

    const authorizationHeaders = {
        Authorization: 'Basic ' + btoa('0055c1dffd9a6620000000001:K005/rdzb3GGfdw8e+3OZMqsfP2nHd4')
      };
      
      fetch('https://cors-anywhere.herokuapp.com/https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
        method: 'GET',
        headers: authorizationHeaders
      })
      .then(response => response.json())
      .then(data => {
        console.log(data)
        const authToken = data.authorizationToken;
        const apiUrl = data.apiUrl
        fetch(`https://cors-anywhere.herokuapp.com/${apiUrl}/b2api/v2/b2_get_upload_url?bucketId=254c212d4f3f1d998ab60612`, {
            method: 'GET',
            headers: {
                "Authorization": authToken,
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const uploadUrl = data.uploadUrl
            const authToken = data.authorizationToken
            const bucketId = data.bucketId

            // Proceed to the next steps
            uploadFile(uploadUrl, authToken, bucketId, codeText);
        });


      })
      .catch(error => {
        console.error('Error while authorizing account:', error);
      });
      

      function uploadFile(uploadUrl, authToken, bucketId, codeText) {

        const blob = new Blob([codeText], { type: 'text/plain' });
      
        const file = new File([blob], 'instructor_script.sh', { type: 'text/plain' });
        const fileName = file.name;
      
        const headers = {
          Authorization: authToken,
          'X-Bz-File-Name': fileName,
          'Content-Type': 'b2/auto',
          'X-Bz-Content-Sha1': 'do_not_verify',
        };
      
        fetch('https://cors-anywhere.herokuapp.com/' + uploadUrl, {
          method: 'POST',
          headers,
          body: file
        })
        .then(response => response.json())
        .then(data => {
          console.log('File uploaded successfully:', data);
          setIsHidden(false)
          setIsLoadingButton(false)
        })
        .catch(error => {
          console.error('Error while uploading file:', error);
        });
      }
      

}
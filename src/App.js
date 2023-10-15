import {useRef, useState } from 'react';
import './App.css';
import Papa from 'papaparse';
import {uploadScriptToCloud} from './storage/cloud'
import Spreadsheet from './components/Spreadsheet';

function App() {
  
  const [data, setData] = useState([]);
  const [code, setCode] = useState("");
  const [codeText, setCodeText] = useState("");
  const [isHidden, setIsHidden] = useState(true);
  const [isLoadingButton, setIsLoadingButton] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isCopiedScript, setIsCopiedScript] = useState(false);
  const [isCopiedInstall, setisCopiedInstall] = useState(false)

  function getDataFromSheet(rowData){
    setIsHidden(true);
    setData([]);
    setCode("");
    setErrorMessage(null);
    setIsHidden(true);
    setIsCopiedScript(false);
    setisCopiedInstall(false);

    const cleanedData = rowData.filter(item => {
      return (item.name !== null && item.sshKey !== null);
    })
    // console.log(cleanedData);
    setData(cleanedData);
  }

  function generateBashScript(data){
    generateBashScriptText(data);
    setIsHidden(true);
    // console.log("Test", data)
    let script = (
      <>
        <code className='script-code code-container'>
        
          #!/bin/bash <br />
          {data.map(item => (
            <div key={item.id}>
              <br />
              sudo useradd --create-home --shell /bin/bash --gid bootcamper --comment "{item.name}" bootcamper{item.id}
              <br />
              #- Setup ssh key for bootcamper<br />
              sudo mkdir -p /home/bootcamper{item.id}/.ssh/<br />
              sudo touch /home/bootcamper{item.id}/.ssh/authorized_keys<br />
              sudo sh -c 'echo ${ `"${item.sshKey}" >>`} /home/bootcamper{item.id}/.ssh/authorized_keys'<br />
              sudo chown -R bootcamper{item.id}:bootcamper /home/bootcamper{item.id}/.ssh/<br />
              sudo chmod 644 /home/bootcamper{item.id}/.ssh/authorized_keys<br />
              sudo chmod 700 /home/bootcamper{item.id}/.ssh/<br />
            
            </div>
          
          ))
          }
          <br />
          #- Check the user list <br />
          echo "====================================="<br />
          echo "Bootcamper instance setup successful!"<br />
          echo "====================================="<br />
          less /etc/passwd | grep bootcamper
        </code>
      </>
    )

    setCode(script);
    alert("Setup script successfully generated!")
  }

  function generateBashScriptText(data){
    // console.log("Test", data)
    let script = `
#!/bin/bash 
${data.map(item => (
`
sudo useradd --create-home --shell /bin/bash --gid bootcamper --comment "${item.name}" bootcamper${item.id}
#- Setup ssh key for bootcamper
sudo mkdir -p /home/bootcamper${item.id}/.ssh/
sudo touch /home/bootcamper${item.id}/.ssh/authorized_keys
sudo sh -c 'echo ${ `"${item.sshKey}" >>`} /home/bootcamper${item.id}/.ssh/authorized_keys'
sudo chown -R bootcamper${item.id}:bootcamper /home/bootcamper${item.id}/.ssh/
sudo chmod 644 /home/bootcamper${item.id}/.ssh/authorized_keys
sudo chmod 700 /home/bootcamper${item.id}/.ssh/
`
)).join('\n') // join method will remove the "," for each items
}
#- Check the user list 
echo "====================================="
echo "Bootcamper instance setup successful!"
echo "====================================="
less /etc/passwd | grep bootcamper

    `

    setCodeText(script);
  }

  function downloadShellScript(){
    generateBashScriptText(data);
    // console.log(codeText)
    const blob = new Blob([codeText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'instructor_script.sh';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  const sshScriptCodeRef = useRef(null);
  const manualInstallCodeRef = useRef(null);
  function copyToClipboard(type){
    let codeElement;
    if(type === 1){
      codeElement = sshScriptCodeRef.current;
    } else if(type === 2){
      codeElement = manualInstallCodeRef.current;
    } else {
      return alert("Error copying to clipboard");
    }

    console.log(codeElement)
    const range = document.createRange();
    range.selectNode(codeElement);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);

    try {
      document.execCommand("copy");
      if(type === 1) {
        setIsCopiedScript(true);
      }
      if(type === 2){
        setisCopiedInstall(true);
      }
    } catch (err) {
      console.error("Unable to copy to clipboard");
      alert("Error copying to clipboard");
    } finally {
      window.getSelection().removeAllRanges();
    }
  };

  function resetCopyClipboardBtn(){
    setTimeout(() => {
      setIsCopiedScript(false);
      setisCopiedInstall(false);
    }, 5000)
  }


  // console.log(codeText)
  return (
    <div className="App">
      <h1 className='align'>Generate Script for CSP2 Hosting (For Instructors)</h1>
      <br />
      <div className="main-content-container">

        <Spreadsheet getDataFromSheet={getDataFromSheet}/>
        
        <div className='mt align'>
          {/* <button className='btn green' onClick={getDataFromSheet}>REFRESH</button> */}
          <button className='btn blue' onClick={() => generateBashScript(data)}><strong>GENERATE SCRIPT</strong></button>
          <button className='btn' onClick={downloadShellScript}>Download script</button>
          <button className='btn' disabled={isLoadingButton ? true : false} onClick={() => {
            uploadScriptToCloud(codeText, setIsHidden, setIsLoadingButton, setErrorMessage)
            setIsCopiedScript(false);
          }}>
            {isLoadingButton ?
              "Generating link..."
            :
              "Get Script Link"
            }
          </button>
        </div>
        <br />
        {!errorMessage ?
          <div className='align'>
            <div className="footer-code" style={{display: isHidden ? "none" : "inline-block"}} >
              <code ref={sshScriptCodeRef}>
                curl -sSf https://f005.backblazeb2.com/file/script-aws-setup/instructor_script.sh | bash 
              </code>

              {isCopiedScript ?
                  <button className='copy-ok'>✔</button>
                  :
                  <button className='copy-btn' onClick={() => {
                    copyToClipboard(1)
                    resetCopyClipboardBtn()
                  }}>copy</button>
              }
            </div>
          </div>
        :
          <div className='align'>
            <code className="footer-code align">
              {errorMessage} <a href="https://cors-anywhere.herokuapp.com/corsdemo" target='_blank'>Request access</a>
            </code>
          </div>
        }

        <div className='container align'>
          <pre>
            {code}
          </pre>
          
        </div>
      </div>
      <div className="center"> 
        <div className="tut bg-tut">
          <h4>NOTE: If the "Get Script Link" doesn't work, add the script to the remote server manually:</h4> <br />
          <p>- Download the script and open terminal from the location of instructor_script.sh</p>
          <div className='align'>
            <div className="footer-code" >
              <code ref={manualInstallCodeRef}>
                scp -i ~/.ssh/zuitt_keypair_us_east2.pem instructor_script.sh ubuntu@{"<aws_server_domain_name>"}:~/
              </code>
              {isCopiedInstall ?
                <button className='copy-ok'>✔</button>
                :
                <button className='copy-btn' onClick={() => {
                  copyToClipboard(2);
                  resetCopyClipboardBtn();
                }}>copy</button>
              }
            </div>
          </div>
          
          <p>- Change the permission of the file to executable with <code>`chmod +x instructor_script.sh`</code></p>
          <p>- Execute the script with <code>`./instructor_script.sh`</code>.</p>
        </div>
      </div>

    </div>
  );
}

export default App;

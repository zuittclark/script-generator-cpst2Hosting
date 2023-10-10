import { useEffect, useState } from 'react';
import './App.css';
import Papa from 'papaparse';

function App() {
  
  const [data, setData] = useState([]);
  const [code, setCode] = useState("");
  const [codeText, setCodeText] = useState("")
  const [isLoading, setIsLoading] = useState(true)


  function getDataFromSheet(){
    setIsLoading(true);
    setData([]);
    setCode("");
    fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vSu2vC1xE-Zm11fwv0Nkd9r0hRqiIYCBHnPZsScIkQf_mqglwFMeSxXWRwq61-l1L4-hYzm53d8duzL/pub?output=csv')
    .then(response => response.text())
    .then(data => {
      // Parse CSV from Google Sheets
      Papa.parse(data, {
        header: true,
        dynamicTyping: true,
        complete: function (results) {
          // 'results.data' contains the parsed CSV data as an array of objects
          setData(results.data);
          setIsLoading(false);
        },
        error: function (error) {
          console.error('CSV parsing error:', error.message);
        },
      });
      ;
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
  }

  function generateBashScript(data){
    generateBashScriptText(data);
    console.log("Test", data)
    let script = (
      <>
        <code className='code-container'>
        
          #!/bin/bash <br />
          {data.map(item => (
            <div key={item.id}>
              <br />
              sudo useradd --create-home --shell /bin/bash --gid bootcamper --comment "{item.name}" bootcamper{item.id}
              <br />
              #- Setup ssh key for bootcamper<br />
              sudo mkdir -p /home/bootcamper{item.id}/.ssh/<br />
              sudo touch /home/bootcamper{item.id}/.ssh/authorized_keys<br />
              sudo chown -R bootcamper{item.id}:bootcamper /home/bootcamper{item.id}/.ssh/<br />
              sudo chmod 644 /home/bootcamper{item.id}/.ssh/authorized_keys<br />
              sudo chmod 700 /home/bootcamper{item.id}/.ssh/<br />
              sudo echo { `"${item.sshKey}" >>`} /home/bootcamper1/.ssh/authorized_keys <br />
            
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
  }

  function generateBashScriptText(data){
    console.log("Test", data)
    let script = `
#!/bin/bash 
${data.map(item => (
`
sudo useradd --create-home --shell /bin/bash --gid bootcamper --comment "${item.name}" bootcamper${item.id}
#- Setup ssh key for bootcamper
sudo mkdir -p /home/bootcamper${item.id}/.ssh/
sudo touch /home/bootcamper${item.id}/.ssh/authorized_keys
sudo chown -R bootcamper${item.id}:bootcamper /home/bootcamper${item.id}/.ssh/
sudo chmod 644 /home/bootcamper${item.id}/.ssh/authorized_keys
sudo chmod 700 /home/bootcamper${item.id}/.ssh/
sudo echo ${ `"${item.sshKey}" >>`} /home/bootcamper1/.ssh/authorized_keys
`
)).join('\n')
}
#- Check the user list 
echo "====================================="
echo "Bootcamper instance setup successful!"
echo "====================================="
less /etc/passwd | grep bootcamper

    `

    setCodeText(script);
  }

  const downloadShellScript = () => {
    generateBashScriptText(data);
    console.log(codeText)
    const blob = new Blob([codeText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'script.sh';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(()=>{
    getDataFromSheet()
  }, [])


  // console.log(codeText)
  return (
    <div className="App">
      <h2>Generate Script for CSP2 Hosting (For Instructors)</h2>
      <br />
      {isLoading ? 
      <div className='container'>
        <h4>Loading Google Sheets data...</h4>
      </div>
      :
      <>
        <a className='add-link' href="https://docs.google.com/spreadsheets/d/1pKiEQtIMg__GtYmkLzjNuNVCBBVTm_ZJgdi-tN0IdoU/edit?usp=sharing" target='_blank'>Update Bootcamper Data</a>
        <div className='mt'>
          <button className='btn green' onClick={getDataFromSheet}>REFRESH</button>
          <button className='btn' onClick={() => generateBashScript(data)}><strong>GENERATE SCRIPT</strong></button>
          <button className='btn' onClick={downloadShellScript}>Download script</button>
        </div>
        <div className='container'>
          <pre>
            {code}
          </pre>
        </div>
      </>



      }

    </div>
  );
}

export default App;

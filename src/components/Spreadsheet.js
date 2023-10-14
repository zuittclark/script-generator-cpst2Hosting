import React, { useEffect, useState } from 'react'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import 'ag-grid-enterprise';

const Spreadsheet = ({getDataFromSheet}) => {

  const columnDefs = [
    { headerName: 'No.', field: 'id', width: 70 },
    { headerName: 'Name', field: 'name', editable: true, width: 200 },
    { headerName: 'SSH Key', field: 'sshKey', editable: true, width: 530 },
  ];

  const sampleKey = 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC0iZ2zcxo1q9d1PXwys3g1bmR3tLoz4Aq6KU+1eDZM5VShmc+MweE4p4dA2k02DyKv8bXPhzMREpJ7L/4y7aCz3VVKC0B/XgCIiNQZ4LONRmX8kJH0Wppu8NQPOZBfNjTKlZ5NlLi9J15JbYpU3+Xym4Cot1E5uCCa0qRBbV5Wia7W25Bq6LG2Cf1b6TE+JjXp2kJwB/DrX9vB7Df1Aar8TdrhABuLM43sLXek6ctL3YXjyQio1jA5ovjYz6A4bmkwnWW4nRi+D33KGS6O2WXWRs0vl6brZIQ1iMIKzSmUSFh6zV8UoQnoKzDbCK1KrRpQmyG4+PMrkE2y4mYS0HXaBCy3 username@hostname'

  const [rowData, setRowData] = useState([
    { id: 1, name: 'Doe, John A.', sshKey: sampleKey },
    { id: 2, name: 'Smith, Jane B.', sshKey: sampleKey },
    { id: 3, name: 'Johnson, Bob C.', sshKey: sampleKey },
    { id: 4, name: null, sshKey: null },
    { id: 5, name: null, sshKey: null },
    { id: 6, name: null, sshKey: null },
    { id: 7, name: null, sshKey: null },
    { id: 8, name: null, sshKey: null },
    { id: 9, name: null, sshKey: null },
    { id: 10, name: null, sshKey: null },
  ]);

//   console.log("Row Data:")
//   console.log(rowData)


  const onCellValueChanged = (event) => {
    const { data, colDef } = event;
    const updatedRowData = rowData.map((row) => {
      if (row.id === data.id) {
        return { ...row, [colDef.field]: data[colDef.field] };
      }
      return row;
    });

    setRowData(updatedRowData);
  };

  useEffect(() => {
    getDataFromSheet(rowData)
  }, [rowData])

  return (
    <div className='spreadsheet'>
        <div className="ag-theme-balham-dark" style={{ height: 350, width: 810 }}>
        <h2 className='table-title'>ADD BOOTCAMPER DATA</h2>
        <AgGridReact
            columnDefs={columnDefs}
            rowData={rowData}
            onCellValueChanged={onCellValueChanged}
            enableRangeSelection={true} // Enable clipboard functionality
        />
        </div>
    </div>
  );

}

export default Spreadsheet
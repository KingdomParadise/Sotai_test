import { useEffect, ChangeEvent, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';
import zoomPlugin from "chartjs-plugin-zoom";
import styles from "./index.css"

interface HourDataType {
  cpu_hours: string,
  year: string,
  month: string,
  day: string
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

export const options  = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'CPU Hours Chart',
    },
    zoom: {
      zoom: {
        wheel: {
          enabled: true
        },
        mode: "x",
        speed: 100
      },
      pan: {
        enabled: true,
        mode: "x",
        speed: 0.5
      }
    }
  }
};


export function App() {
  const [file, setFile] = useState<File>();
  const [updated, setUpdated] = useState<boolean>(false);
  const [chartType, setChartType] = useState<String>("Line");
  const [rangeType, setRangeType] = useState<String>("Year");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [chartData, setChartData] = useState<HourDataType[]>([]);
  const [chartState, setChartState] = useState({
    labels:[] as string[],
    datasets: [
      {
        label: 'CPU Hours',
        data: [] as number[],
        backgroundColor: 'rgba(100, 255, 10, 0.5)',
      }
    ],
  });
  // const [labels, setLabels] = useState<string[]>([])


  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadClick = async() => {
    if (!file) {
      return;
    }

    const csv_data = await axios.post('http://localhost:8000/cpuhours/upload', {
        csv:file
      }, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    const cpu_data = csv_data["data"]["data"]

    setChartData(cpu_data)
    const temp = cpu_data.filter((data: HourDataType) => data.day !== 'day')

    let labels_temp = [] as string[]
    temp.forEach((data: HourDataType) => {
      labels_temp.push(`${data.month}/${data.day}/${data.year}`)
    })
    // setLabels(labels_temp)

    let temp_chart_data = [] as number[]
    temp.forEach((temp_data: HourDataType) => 
      temp_chart_data.push(parseFloat(temp_data.cpu_hours))
    )
    setChartState({
      labels: labels_temp,
      datasets: [
        {
          label: 'CPU Hours',
          data: temp_chart_data,
          backgroundColor: 'rgba(100, 255, 10, 0.5)',
        }
      ]
    })

    setUpdated(true)
  }

  const handleChartTpye = (e:any) => {
    setChartType(e.target.value)
  }

  const handleRangeTpye = (e:any) => {
    setRangeType(e.target.value)
  }

  const filterData = () => {
    if(chartData){
      const temp = chartData.filter((data: HourDataType) => data.day !== 'day')
      let filter_labels = [] as string[];
      let filter_data = [] as number[];
      if(startDate > endDate) {
        alert("Please input the startDate and endDate correctly");
        return;
      }
      temp.forEach((data: HourDataType) => {
        const temp_date = new Date(`${data.month}-${data.day}-${data.year}`)

        if(startDate<temp_date && temp_date<endDate) {
          filter_labels.push(`${data.month}/${data.day}/${data.year}`)
          filter_data.push(parseFloat(data.cpu_hours))
        }
      })
      setChartState({
        labels: filter_labels,
        datasets: [
          {
            label: 'CPU Hours',
            data: filter_data,
            backgroundColor: 'rgba(100, 255, 10, 0.5)',
          }
        ]
      })
    }
  }

  const filterDataByRange = ()=> {
    if(chartData){
      const temp = chartData.filter((data: HourDataType) => data.day !== 'day')
      let filter_labels = [] as string[];
      let filter_data = [] as number[];

      let temp_current_year = "" as string;
      let temp_current_month = "" as string;
      let temp_current_week = "" as string;

      let temp_cpu_hours = 0 as number;
      if(rangeType==="Year") {
        temp.forEach((data: HourDataType) => {
            if(temp_current_year!==data.year) {
              temp_current_year = data.year;
              filter_labels.push(`${data.year}`)
              filter_data.push(temp_cpu_hours);
              temp_cpu_hours = 0;
            }
            temp_cpu_hours += parseFloat(data.cpu_hours);
          }
        );
        filter_data.push(temp_cpu_hours)
        filter_data = filter_data.filter((data: number) => data !== 0)

        setChartState({
          labels: filter_labels,
          datasets: [
            {
              label: 'CPU Hours',
              data: filter_data,
              backgroundColor: 'rgba(100, 255, 10, 0.5)',
            }
          ]
        })
      }
      else if(rangeType==="Month") {
        temp.forEach((data: HourDataType) => {
            if(temp_current_month!==data.month) {
              temp_current_month = data.month;
              filter_labels.push(`${data.month}/${data.year}`)
              filter_data.push(temp_cpu_hours);
              temp_cpu_hours = 0;
            }
            temp_cpu_hours += parseFloat(data.cpu_hours);
          }
        );
        filter_data.push(temp_cpu_hours)
        filter_data = filter_data.filter((data: number) => data !== 0)

        setChartState({
          labels: filter_labels,
          datasets: [
            {
              label: 'CPU Hours',
              data: filter_data,
              backgroundColor: 'rgba(100, 255, 10, 0.5)',
            }
          ]
        })
      }
      else if(rangeType==="Week") {
        const temp = chartData.filter((data: HourDataType) => data.day !== 'day')
        let filter_labels = [] as string[];
        let filter_data = [] as number[];

        temp.forEach((data: HourDataType) => {
          const temp_date = new Date(`${data.month}-${data.day}-${data.year}`);
          const week = moment(temp_date).format('W'); 

          if(temp_current_week!==week.toString()) {
            temp_current_month = data.month;
            filter_labels.push(`${week}week/${data.year}`)
            filter_data.push(temp_cpu_hours);
            temp_cpu_hours = 0;
          }
          temp_cpu_hours += parseFloat(data.cpu_hours);
          }
        );
        filter_data.push(temp_cpu_hours)
        filter_data = filter_data.filter((data: number) => data !== 0)
        setChartState({
          labels: filter_labels,
          datasets: [
            {
              label: 'CPU Hours',
              data: filter_data,
              backgroundColor: 'rgba(100, 255, 10, 0.5)',
            }
          ]
        })
      }

    }
    setUpdated(true);
  }

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <p/>
      <div>{file && `${file.name} - ${file.type}`}</div>
      <p/>
      <button onClick={handleUploadClick}>Upload</button>
      <h1>Chart Option</h1>
      <div>
        <div>
          1: &nbsp;Please select the type of Chart:&nbsp;&nbsp;&nbsp;
          <select id="chartType" onChange={(e) => handleChartTpye(e)}>
            <option value="Line">Line</option>
            <option value="Bar">Bar</option>
          </select>
          <p/>
        </div>

        <div>
          2:&nbsp;Filter<p/>
          &nbsp;&nbsp;&nbsp;Start Date:&nbsp;&nbsp;&nbsp;<input type="date" onChange={(event) => setStartDate(new Date(event.target.value))}/><p/>
          &nbsp;&nbsp;&nbsp;End Date:&nbsp;&nbsp;&nbsp;<input type="date"  onChange={(event) => setEndDate(new Date(event.target.value))}/><p/>
          &nbsp;&nbsp;&nbsp;<button onClick={()=>filterData()}>Filter</button><p/>
        </div>

        <div>
          3: &nbsp;Please select the range type of Date:&nbsp;&nbsp;&nbsp;
          <select id="rangeType" onChange={(e) => handleRangeTpye(e)}>
            <option value="Year">Year</option>
            <option value="Month">Month</option>
            <option value="Week">Week</option>
          </select>
          &nbsp;&nbsp;&nbsp;<button onClick={()=>filterDataByRange()}>Show</button>
          <p/>
        </div>
      </div>
      {/* <div>
        {
          chartData && <Bar options={options} data={chartData} />
        }
      </div> */}
      {chartType==="Line" && <Line redraw={updated} options={options} data={chartState} />}
      {chartType==="Bar" && <Bar redraw={updated} options={options} data={chartState} />}
    </div>
  );
}

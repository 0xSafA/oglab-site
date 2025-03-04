import Chart from '@/components/ui/chart';
import cn from 'classnames';
import { ArrowUp } from '@/components/icons/arrow-up';
import { ArrowDown } from '@/components/icons/arrow-down';
import PageHeading from '@/components/common/page-heading';

const BarChart = ({
  widgetTitle,
  series,
  colors,
  prefix,
  totalValue,
  text,
  position,
  percentage,
  categories,
}: any) => {
  const options = {
    options: {
      chart: {
        height: 600,
        type: 'line',
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: '60%',
          endingShape: 'flat',
        },
      },
      stroke: {
        curve: 'smooth',
        width: [0, 3],
      },
      fill: {
        type: 'solid',
        opacity: [1, 0],
      },
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: [0, 0],
      },
      colors: colors,
      xaxis: {
        labels: {
          show: true,
          style: {
            colors: '#1F2937',
            fontSize: '14px',
            fontFamily: "'Lato', sans-serif",
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        categories: categories,
      },
      yaxis: {
        show: true,
        labels: {
          show: true,
          style: {
            color: '#1F2937',
            fontSize: '14px',
            fontFamily: "'Lato', sans-serif",
          },
        },
      },
    },
    series: [
      {
        type: 'column',
        data: series,
      },
    ],
  };

  return (
    <div className="h-full w-full overflow-hidden rounded-lg bg-white p-5 shadow-sm md:p-8">
      <div className="mb-5 flex items-center justify-between">
        <PageHeading title={widgetTitle} />

        <div className="flex flex-col">
          <span className="text-lg font-semibold text-green-500">
            {prefix}
            {totalValue}
          </span>

          <div className="flex items-center">
            {position === 'up' && (
              <span className="text-green-500">
                <ArrowUp />
              </span>
            )}
            {position === 'down' && (
              <span className="text-red-400">
                <ArrowDown />
              </span>
            )}
            <span className="text-sm text-heading ms-1">
              <span
                className={cn(
                  position === 'down' ? 'text-red-400' : 'text-green-500'
                )}
              >
                {percentage}
              </span>
              &nbsp;
              {text}
            </span>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-wrap" style={{ display: 'block' }}>
        <Chart
          options={options.options}
          series={options.series}
          height="350"
          width="100%"
          type="bar"
        />
      </div>
    </div>
  );
};

export default BarChart;

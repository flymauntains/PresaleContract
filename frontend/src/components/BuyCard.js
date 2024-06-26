import { global } from "../config/global";
import BuyItem from "./BuyItem";
import { useEffect, useState } from "react";
import { displayRemainTime, ICO_BEFORE, ICO_NOW, ICO_AFTER } from "../utils/utils";
import PresaleContractABI from "../assets/abi/PresaleComplete.json";
import { readContract } from "@wagmi/core";


export default function BuyCard(props) {
    const [icoStatus, setIcoStatus] = useState(ICO_NOW)
    const [icoStatusTitle, setIcoStatusTitle] = useState(``)
    const [icoStatusDetail, setIcoStatusDetail] = useState(``)
    const [startSaleDate, setStartSaleDate] = useState(null);
    const [endSaleDate, setEndSaleDate] = useState(null);
    const [curTime, setCurTime] = useState(false);

    useEffect(() => {
        async function fetchSaleDates() {
            try {
                const startDate = await readContract({
                    address: "0x9e499f31906674fE5091067Fa83ccbe2851038Aa",
                    abi: PresaleContractABI,
                    functionName: 'startSaleDate'
                });
                const endDate = await readContract({
                    address: "0x9e499f31906674fE5091067Fa83ccbe2851038Aa",
                    abi: PresaleContractABI,
                    functionName: 'endSaleDate'
                });
                setStartSaleDate(startDate);
                setEndSaleDate(endDate);
            } catch (error) {
                console.error("Error fetching sale dates:", error);
            }
        }

        fetchSaleDates();
    }, []);

    useEffect(() => {
      const timerID = setInterval(() => {
          const now = Math.round(Date.now() / 1000);
          setCurTime(now);
      }, 1000);

      return () => {
          clearInterval(timerID);
      };
      // eslint-disable-next-line
  }, []);
    // useEffect(() => {
    //     if (props.totalSoldAmount >= global.totalVolume) setIcoStatus(ICO_AFTER)
    //     else if (props.roundNumber < 1) setIcoStatus(ICO_BEFORE)
    //     else if (props.roundNumber < 25) setIcoStatus(ICO_NOW)
    //     else setIcoStatus(ICO_AFTER)
    // }, [props.roundNumber, props.totalSoldAmount])

    const [timer, setTimer] = useState(0)

    useEffect(() => {
        const timerID = setInterval(() => {
            const now = Math.round(Date.now() / 1000);
            const _time = props.nextRoundStartTime - now;
            if (_time > 0) setTimer(_time)
        }, 1000);

        return () => {
            clearInterval(timerID);
        };
        // eslint-disable-next-line
    }, [props.nextRoundStartTime]);


    useEffect(() => {
      if (Number(endSaleDate) >= curTime && curTime >= Number(startSaleDate)) {
        setIcoStatusTitle("Presale now!!!");
        // setIcoStatusDetail(`Presale ends at ${new Date(Number(endSaleDate) * 1000).toLocaleString()}`);
        setIcoStatusDetail(`Presale ends at 06/31/2024, 4:00:00 PM`);
      } else if (curTime < Number(startSaleDate)) {
        setIcoStatusTitle("Presale is not started yet!");
        setIcoStatusDetail(`Presale starts at ${new Date(Number(startSaleDate * 1000)).toLocaleString()}.`);
      }
 
    }, [timer, curTime, startSaleDate, endSaleDate]);
    


    return (
        <div className="w-full lg:w-[600px] flex flex-col items-center justify-center text-center px-2 pb-[100px]">
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 w-full lg:w-11/12 py-2 bg-gray-200/[0.1] flex flex-col justify-center text-center px-2 my-3">
                <div className="flex flex-col items-center">
                    <label className="text-3xl sm:text-4xl font-bold block bg-gradient-to-r from-pink-100 via-yellow-300 to-yellow-200 bg-clip-text text-transparent">
                        {`PRESALE - ${icoStatus}`}
                    </label>
                    <label className="text-1xl sm:text-2xl font-bold block bg-gradient-to-r from-pink-100 via-yellow-300 to-yellow-200 bg-clip-text text-transparent animate-pulse">
                        {icoStatusTitle}
                    </label>
                    <label className="text-gray-50 text-lg">
                        {icoStatusDetail}
                    </label>
                </div>
            </div>
            <BuyItem
                setRefresh={props.setRefresh}
                refresh={props.refresh}
                payTokenBalance={props.payTokenBalance}
                payTokenAllowance={props.payTokenAllowance}
                ethBalance={props.ethBalance}
                currentTokenPrice={props.currentTokenPrice}
                icoStatus={icoStatus}
                icoStatusTitle={icoStatusTitle}
                icoStatusDetail={icoStatusDetail}
            />
        </div>
    );
}

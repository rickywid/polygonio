import React, { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function App() {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [stocksTicker, setTickers] = useState<any>([])
  const [answer, setAnswer] = useState<any>([])
  const [message, setMessage] = useState<string>("")
  const [gameDone, setGameDone] = useState<boolean>(false)
  const [reveal, setReveal] = useState<boolean>(false)
  const [showList, setShowList] = useState<boolean>(false)

  useEffect(() => {

    localStorage.setItem('streak', '0')

    const tickers = ['AAPL', 'AMZN', 'GOOG', 'MSFT', 'FB', 'NFLX', 'TWTR', 'ABNB', 'UBER', 'GME', 'BB', 'TSLA', 'SNAP', 'RBLX', 'COIN']
    let arr: string[] = []

    while (arr.length < 5) {

      const index = randomNum(tickers.length, 0)

      if (!arr.includes(tickers[index])) {
        arr.push(tickers[index])
      }
    }


    const day = new Date().getDate()
    const month = new Date().getMonth()
    const year = new Date().getFullYear()

    const dayStr = day < 10 ? `0${day}` : day
    const monthStr = month < 10 ? `0${month}` : month
    const yearStr = year < 10 ? `0${year}` : year

    Promise.all([
      fetch(`https://api.polygon.io/v1/open-close/${arr[0]}/${yearStr}-${monthStr}-${dayStr}?apiKey=Eoq2ZsITb6G_7Kfyp4ZeapVVQIyybHVX`).then(res => res.json()),
      fetch(`https://api.polygon.io/v1/open-close/${arr[1]}/${yearStr}-${monthStr}-${dayStr}?apiKey=Eoq2ZsITb6G_7Kfyp4ZeapVVQIyybHVX`).then(res => res.json()),
      fetch(`https://api.polygon.io/v1/open-close/${arr[2]}/${yearStr}-${monthStr}-${dayStr}?apiKey=Eoq2ZsITb6G_7Kfyp4ZeapVVQIyybHVX`).then(res => res.json()),
      fetch(`https://api.polygon.io/v1/open-close/${arr[3]}/${yearStr}-${monthStr}-${dayStr}?apiKey=Eoq2ZsITb6G_7Kfyp4ZeapVVQIyybHVX`).then(res => res.json()),
      fetch(`https://api.polygon.io/v1/open-close/${arr[4]}/${yearStr}-${monthStr}-${dayStr}?apiKey=Eoq2ZsITb6G_7Kfyp4ZeapVVQIyybHVX`).then(res => res.json())
    ]).then(res => {

      if (res[0].status === "ERROR") {
        setMessage("Website is busy. Refresh page in 30 seconds and try again.")
      }

      const answer = [...res].sort((a, b) => {
        if (a.close > b.close) {
          return -1;
        }
        if (a.close < b.close) {
          return 1;
        }
        return 0;
      });


      setTickers(arr)
      setAnswer(answer)
    })
  }, [])

  const randomNum = (limit: number, low = 2020) => {
    const min = Math.ceil(low);
    const max = Math.floor(limit - 1);
    const num = Math.floor(Math.random() * (max - min + 1)) + min;

    return num;
  }

  const checkAnswer = () => {
    let streak = Number(localStorage.getItem('streak'))

    setGameDone(true)
    for (let i = 0; i < stocksTicker.length; i++) {
      if (stocksTicker[i] !== answer[i].symbol) {
        localStorage.setItem('streak',String(0))
        setMessage('INCORRECT. REFRESH PAGE TO PLAY AGAIN.')
        return
      }
    }
    streak += 1;
    localStorage.setItem('streak',String(streak++))
    setMessage('SUCCESS!')
  }

  const startGame = () => {
    setGameDone(false)
  }

  return (
    <div>
      {showList && (
        <div className="list">
          <button className={stocksTicker.includes('AAPL') ? 'active' : ''}>Apple</button>
          <button className={stocksTicker.includes('AMZN') ? 'active' : ''}>Amazon</button>
          <button className={stocksTicker.includes('GOOG') ? 'active' : ''}>Google</button>
          <button className={stocksTicker.includes('MSFT') ? 'active' : ''}>Microsoft</button>
          <button className={stocksTicker.includes('FB') ? 'active' : ''}>Facebook</button>
          <button className={stocksTicker.includes('NFLX') ? 'active' : ''}>Netflix</button>
          <button className={stocksTicker.includes('TWTR') ? 'active' : ''}>Twitter</button>
          <button className={stocksTicker.includes('ABNB') ? 'active' : ''}>AirBnB</button>
          <button className={stocksTicker.includes('UBER') ? 'active' : ''}>Uber</button>
          <button className={stocksTicker.includes('GME') ? 'active' : ''}>Gamestop</button>
          <button className={stocksTicker.includes('BB') ? 'active' : ''}>Blackberry</button>
          <button className={stocksTicker.includes('TSLA') ? 'active' : ''}>Tesla</button>
          <button className={stocksTicker.includes('SNAP') ? 'active' : ''}>Snap</button>
          <button className={stocksTicker.includes('RBLX') ? 'active' : ''}>Roblox</button>
          <button className={stocksTicker.includes('COIN') ? 'active' : ''}>Coinbase</button>
        </div>
      )}
      <small className="show-list" onClick={() => setShowList(!showList)}>{showList ? 'Hide': "Companies list"}</small>
      <main>
        <h1>WALLSTREET</h1>
        <p className="subheader">Rearrange the list of company's stock price from highest to lowest.</p>
        <div className="draggable-wrap">
          <div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={stocksTicker}
                strategy={verticalListSortingStrategy}
              >
                {stocksTicker.map((id: any) => <SortableItem key={id} id={id} />)}
              </SortableContext>
            </DndContext>
          </div>
          <div>
            {!gameDone && <button onClick={checkAnswer}>check!</button>}
            {gameDone && <button onClick={() => setReveal(true)}>Show answers</button>}
            <small className="streak">Streak: {localStorage.getItem('streak')}</small>
            <p className={`message ${message === 'SUCCESS!' ? "green" : "red"}`}>{message}</p>
          </div>
          {reveal &&
            <div className="answers">{answer.map((id: any) => (
              <div className="answer">
                <p>{id.symbol}</p>
                <p>${id.close}</p>
              </div>
            ))}</div>
          }
        </div>
      </main>
    </div>
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setTickers((items: any) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }
}
export default App


function SortableItem(props: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    height: '50px',
    border: '1px solid lightgrey',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '1px 5px 13px -1px rgba(196,196,196,0.75)',
    background: "white"
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {props.id}
    </div>
  );
}
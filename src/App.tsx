import { useEffect, useState } from 'react';
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
import logo from './stockmarket.png'
import tickers from './tickers';

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
  const [headlines, setHeadlines] = useState<{ title: string, url: string }[]>([])
  const BASEURL = 'https://api.polygon.io/v1/open-close'
  const POLYGONAPIKEY = 'Eoq2ZsITb6G_7Kfyp4ZeapVVQIyybHVX'
  const NEWSAPIKEY = 'e20d57e298b3499901ab4109ce72af7f'

  useEffect(() => {

    try {
      fetch(`https://gnews.io/api/v4/top-headlines?token=${NEWSAPIKEY}&topic=technology&&country=us&language=en`).then(res => {
        if (res.status !== 200) {
          throw Error('Fetching headlines data available on localhost only.')
        }
        return res.json()
      }).then(data => {
        setHeadlines(data.articles)
      }).catch(err => {
        console.log(err)
      })
    } catch (e) {
      console.log(e)
    }
  }, [])



  useEffect(() => {
    let streak = localStorage.getItem('streak') || '0'
    localStorage.setItem('streak', streak)

    let arr: string[] = []

    while (arr.length < 5) {

      const index = randomNum(tickers.length, 0)

      if (!arr.includes(tickers[index].symbol)) {
        arr.push(tickers[index].symbol)
      }
    }

    const day = new Date().getDate()
    const month = new Date().getMonth()
    const year = new Date().getFullYear()

    const dayStr = day < 10 ? `0${day}` : day
    const monthStr = month < 10 ? `0${month}` : month
    const yearStr = year < 10 ? `0${year}` : year

    Promise.all([
      fetch(`${BASEURL}/${arr[0]}/${yearStr}-${monthStr}-${dayStr}?apiKey=${POLYGONAPIKEY}`).then(res => res.json()),
      fetch(`${BASEURL}/${arr[1]}/${yearStr}-${monthStr}-${dayStr}?apiKey=${POLYGONAPIKEY}`).then(res => res.json()),
      fetch(`${BASEURL}/${arr[2]}/${yearStr}-${monthStr}-${dayStr}?apiKey=${POLYGONAPIKEY}`).then(res => res.json()),
      fetch(`${BASEURL}/${arr[3]}/${yearStr}-${monthStr}-${dayStr}?apiKey=${POLYGONAPIKEY}`).then(res => res.json()),
      fetch(`${BASEURL}/${arr[4]}/${yearStr}-${monthStr}-${dayStr}?apiKey=${POLYGONAPIKEY}`).then(res => res.json())
    ]).then(res => {

      if (res[0].status === "ERROR") {
        setMessage("API request limit has been reached. Try refreshing page in 30-60 seconds.")
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
        localStorage.setItem('streak', String(0))
        setMessage('INCORRECT. REFRESH PAGE TO PLAY AGAIN.')
        return
      }
    }
    streak += 1;
    localStorage.setItem('streak', String(streak++))
    setMessage('SUCCESS!')
  }


  let options: any = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  let today = new Date();

  return (
    <div>
      <div className="ticker-top">
        <div className="list list-top">
          {headlines.map(headline => <a key={headline.title} href={headline.url} target="_blank" rel="noopener noreferrer">{headline.title}</a>)}
          {/* {tickers.map(ticker => <button className={stocksTicker.includes(ticker.symbol) ? 'active' : ''}>{ticker.name}</button>)} */}
        </div>
      </div>
      {/* <small className="show-list" onClick={() => setShowList(!showList)}>{showList ? 'Hide' : "Companies list"}</small> */}
      <main>
        <div className="header">
          <img src={logo} alt="logo" />
          <h1>WALLSTREET</h1>
        </div>
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
            {!gameDone && <button className="check-btn" onClick={checkAnswer}>check!</button>}
            {gameDone && <button className="show-answers-btn" onClick={() => setReveal(true)}>Show answers</button>}
            <small className="streak">Streak: {localStorage.getItem('streak')}</small>
            {message && <p className={`message ${message === 'SUCCESS!' ? "green" : "red"}`}>{message}</p>}
          </div>
          {reveal &&
            <div className="answers">
              {answer.map((id: any) => {
                console.log(id)
                return (
                  <div key={id} className="answer">
                    <p>{id.symbol}</p>
                    <p>${id.close}</p>
                  </div>
                )
              }
              )}
              <small className="last-update">Last updated {today.toLocaleDateString("en-US", options)} from <a href="https://polygon.io">Polygon</a> </small>
            </div>
          }
        </div>
      </main>
      <div className="ticker-bottom">
        <div className="list list-bottom">
          {headlines.map(headline => <a key={headline.title} href={headline.url} target="_blank" rel="noopener noreferrer">{headline.title}</a>)}
        </div>
      </div>
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

'use client'

import { useRef, useState } from 'react'
import useSWR from 'swr'
import Image from 'next/image';


const Form = () => {
  const messageInput = useRef<HTMLTextAreaElement | null>(null)
  const [response, setResponse] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleEnter = (
    e: React.KeyboardEvent<HTMLTextAreaElement> &
      React.FormEvent<HTMLFormElement>
  ) => {
    if (e.key === 'Enter' && isLoading === false) {
      e.preventDefault()
      setIsLoading(true)
      handleSubmit(e)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const message = messageInput.current?.value
    if (message !== undefined) {
      setResponse((prev) => [...prev, message])
      messageInput.current!.value = ''
    }

    if (!message) {
      return
    }

    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message:message,
      }),
    })


    if (!response.ok) {
      throw new Error(response.statusText)
    }

    const data = response.body
    if (!data) {
      return
    }

    const reader = data.getReader()
    const decoder = new TextDecoder()
    let done = false

    setResponse((prev) => [...prev, message])

    let currentResponse: string[] = []
    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading
      const chunkValue = decoder.decode(value)
      // currentResponse = [...currentResponse, message, chunkValue];
      currentResponse = [...currentResponse, chunkValue]
      setResponse((prev) => [...prev.slice(0, -1), currentResponse.join('')])
    }

    // breaks text indent on refresh due to streaming
    // localStorage.setItem('response', JSON.stringify(currentResponse));
    setIsLoading(false)
  }

  useSWR('fetchingResponse', async () => {
    const storedResponse = localStorage.getItem('response')
    if (storedResponse) {
      setResponse(JSON.parse(storedResponse))
    }
  })

  return (
    <div className='flex justify-center pt-14'>

      <div className='w-full mx-2 mb-72 flex flex-col items-start gap-3 pt-6 last:mb-6 overflow-auto md:mx-auto md:max-w-3xl'>
        {isLoading
          ? response.map((item: any, index: number) => {
              return (
                <div
                  key={index}
                  className={`${
                    index % 2 === 0 ? 'bg-blue-500' : 'bg-gray-500'
                  } p-3 rounded-lg`}
                >
                  <p className='text-white'>{item}</p>
                </div>
              )
            })
          : response
          ? response.map((item: string, index: number) => {
            let ipfsLink = item.match(/ipfs:\/\/\S+/);
            let path = "";
            if (ipfsLink) {
              path = ipfsLink[0].replace('ipfs://', '');
              path = "https://ipfs.io/ipfs/" + path;
              console.log(path);
            }
              return (
                <div
                  key={index}
                  className={`${
                    index % 2 === 0 ? 'bg-blue-500' : 'bg-gray-500'
                  } p-3 rounded-lg`}
                >
                  <p className='text-white'>{item}</p>
                  {index%2!=0 && ipfsLink ? 
                    <Image
                      src={path}
                      alt="Sorry, no image found"
                      width={300}  // or the width you want
                      height={300} // or the height you want
                    /> :  ""
                  }
                </div>
              )
            })
          : null}
      </div>
      <form
        onSubmit={handleSubmit}
        className='fixed bottom-0 w-full md:max-w-3xl bg-gray-700 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)] mb-4'
      >
        <textarea
          name='Message'
          placeholder='What kind of NFTs are you looking for? (e.g. Gif, Metaverse, Blue Sneakers, etc.)'
          ref={messageInput}
          onKeyDown={handleEnter}
          className='w-full resize-none bg-transparent outline-none pt-4 pl-4 translate-y-1 dark:text-white'
        />
        <button
          disabled={isLoading}
          type='submit'
          className='absolute top-[1.4rem] right-5 p-1 rounded-md text-gray-500 dark:hover:text-gray-400 dark:hover:bg-gray-900 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent'
        >
          {isLoading ? 
            <div className="flex justify-center items-center">
              <div className="animate-ping h-1 w-1 bg-blue-300 rounded-full"></div>
              <div className="animate-ping h-1 w-1 bg-blue-300 rounded-full mx-4"></div>
              <div className="animate-ping h-1 w-1 bg-blue-300 rounded-full"></div>
            </div>
          : <svg
              stroke='currentColor'
              fill='currentColor'
              strokeWidth='0'
              viewBox='0 0 20 20'
              className='h-4 w-4 rotate-90'
              height='1em'
              width='1em'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path d='M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z'></path>
            </svg>
          }
        </button>
      </form>
    </div>
  )
}

export default Form

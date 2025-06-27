import React from 'react'

function NearShopLoader() {
  return (
    <div className="relative bg-white rounded-lg">
      <div className='relative z-10'>
        <div className="animate-pulse relative flex w-full h-[170px] max-w-full shrink-0 items-center justify-center overflow-hidden bg-slate-200"></div>
      </div>
      <div className='px-4 pt-3 pb-5 w-full flex items-center gap-3'>
        <div className='flex gap-4 w-full'>
          <div className="-mt-14 animate-pulse relative z-20 border-[3px] border-solid border-white flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200"></div>
          <div className='mt-2 flex-1 space-y-3'>
            <div className="animate-pulse w-full h-3.5 bg-slate-200 rounded"></div>
            <div className="animate-pulse w-full h-3 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NearShopLoader
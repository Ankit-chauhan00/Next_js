import React, {  ReactNode } from 'react'
import  Navbar  from '@/components/navigation/navbar/page';

const RootLayout = ({children}:{children : ReactNode}) => {
  return (
    <main>
      <Navbar/>
      {children}
    </main>
  )
}

export default RootLayout
import * as React from 'react'
import Footer from './footer'

const Layout = ({ pageTitle, children }) => {
  return (
    <div>
      <main>
        <h1>{pageTitle}</h1>
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout
import { auth } from '@/auth'


const Home = async () => {
  const session = await auth();

  return (
    <>
    <h1>Welcome to the next js world</h1>
    </>
  )
}

export default Home
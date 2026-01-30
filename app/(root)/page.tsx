import { auth } from '@/auth'


const Home = async () => {
  const session = await auth();

  return (
    <>

    </>
  )
}

export default Home
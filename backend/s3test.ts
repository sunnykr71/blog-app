import { getListObjects } from './src/lib/s3'

async function main() {
  const response = await getListObjects()
  console.log(response)
}

main()

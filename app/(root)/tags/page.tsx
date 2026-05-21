import TagCard from "@/components/cards/TagCard";
import DataRenderer from "@/components/DataRenderer";
import CommonFilters from "@/components/filters/CommonFilters";
import LocalSearch from "@/components/search/LocalSearch";
import { TagFilters } from "@/constants/filters";
import ROUTES from "@/constants/routs";
import { EMPTY_TAGS } from "@/constants/states";
import { getTags } from "@/lib/action/tag.action";
import { RouteParams } from "@/types/global"


const Tags = async ({searchParams}: RouteParams) => {

  // by default the value we get from search params iis a string so its need to be converted into number
  const {page, pageSize, query, filter} = await searchParams;

  const {success, data, error} = await getTags({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query: query,
    filter
  })

  const { tags } = data || {};

  return (
    <> 
    <h1 className="h1-bold text-dark100_light900 text-3xl">Tags</h1>

    <section className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
      <LocalSearch
      //where we are on which route we are apping search querry
      route={ROUTES.TAGS}
      imgSrc="/icons/search.svg"
      placeholder="Search Tags"
      iconPosition= "left"
      otherClasses="flex-1"
      />
      <CommonFilters 
      filters={TagFilters}
      otherClasses="min-h-[56px] sm:min-w-[170px]"
      />
    </section>

    <DataRenderer
    success={success}
    error={error}
    data={tags}
    empty={EMPTY_TAGS}
    render={(tags)=>(
      <div className="mt-10 flex w-full  justify-center flex-wrap gap-6">
        {
          tags.map((tag)=><TagCard key={tag._id} {... tag} />)
        }
      </div>
    )}
    />
    </>
  )
}

export default Tags
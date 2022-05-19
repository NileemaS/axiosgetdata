function Pagination({ items, pageSize, onPageChange }) {
  const { Button } = ReactBootstrap;
  if (items.length <= 1)
    return null;

  let num = Math.ceil(items.length / pageSize);
  let pages = range(1, num );
  const list = pages.map((page) => {
    return (
      <Button key={page} onClick={onPageChange} className="page-item">
        {page}
      </Button>
    );
  });
  return (
    <nav>
      <ul className="pagination">{list}</ul>
    </nav>
  );
}

const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};

function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
}

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });

  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
   
    return () => {
      didCancel = true;
    };

  }, [url]);
  return [state, setUrl];
};

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

  

// App that gets data from Hacker News url
function App() {
  const { Fragment, useState, useEffect, useReducer } = React;
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);  

  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "https://api.nobelprize.org/2.1/nobelPrizes",

    {
      nobelPrizes: [],
    }
  );

  const handlePageChange = (e) => {
    setCurrentPage(Number(e.target.textContent));
  };

  let page = data.nobelPrizes;   
  
  if (page.length >= 1) {
    page = paginate(page, currentPage, pageSize);
    console.log(`currentPage: ${currentPage}`);
  }
  
  //Link for reference //
  const RefLink = (props) => {       
    let {fileName, awardYear, category} = props ;
    let chkCategory = category.split(" ");
    chkCategory = (chkCategory[chkCategory.length - 1]).toLowerCase()  ;   
    
    let lastName = fileName.replaceAll(/[()]/g, ' ').split(" ");
    lastName = (lastName[lastName.length - 1]).toLowerCase() ;
    let alink = `https://nobelprize.org/prizes/${chkCategory}/${awardYear}/${lastName}/facts/` ;
    
    return (
        <a href={alink}>
            {alink}
        </a>
      );    
  }  
 
 
  return (
    <Fragment>
      <div className="navbar">
        <Pagination
          items={data.nobelPrizes}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        >
        </Pagination>
      </div>

      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <ul className="list-group">

          {page.map((item, index) => (           
            <li key={index} className="list-group-item well">
              <label>Full Name: </label>  { !(item.laureates[0].fullName.en) ? 'default' : 
                    (item.laureates[0].fullName.en) } <br />
              <label>Award Year: </label> {item.awardYear} <br />
              <label>Motivation: </label> {item.laureates[0].motivation.en} <br/><br/>
              <label>Link for additional reference:</label><br />   

              {RefLink && <RefLink fileName={item.laureates[0].fullName.en}
                                  awardYear={item.awardYear}
                                  category={item.category.en}>
                          </RefLink>
              }     
            </li>
          ))}

        </ul>
      )}

      <ul class="pager">
        <li><a href="#">Previous</a></li>
        <li><a href="#">Next</a></li>
      </ul>
    </Fragment>
  );
}

//https://dog.ceo/api/breed/hound/images//
// message: [] // <a href={item.laureates[0].links[0].href}> {item.laureates[0].links[0].href} </a>//
// ========================================
ReactDOM.render(<App />, document.getElementById("root"));

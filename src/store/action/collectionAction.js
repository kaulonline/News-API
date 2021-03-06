const axios = require('axios')

export const UPDATE_FORM_VALUES = 'UPDATE_FORM_VALUES';
export const TOGGLE_IS_VALIDATED = 'TOGGLE_IS_VALIDATED';
export const TOGGLE_IS_EDITING = 'TOGGLE_IS_EDITING';
export const TOGGLE_IS_LOADING = 'TOGGLE_IS_LOADING';
export const FETCH_COLLECTION_NEWS = 'FETCH_COLLECTION_NEWS';
export const SET_FORM_VALUES = 'SET_FORM_VALUES';
export const CLEAR_FORM_VALUES = 'CLEAR_FORM_VALUES';
export const CHANGE_STATUS = 'CHANGE_STATUS';
//Fetching news from postgres collection
export const getNewsFromPG = () => {
    return async (dispatch, getState) => {
        try {
            const response = await axios.get(`http://localhost:5000/pgcollection/v1/news/fetchNews`)
            // Update store state with news items from PG
            await dispatch({
                type: FETCH_COLLECTION_NEWS,
                payload: {value: response}
            });
        }
        catch (err) {
            console.error(err);
        }
    };
};

// Save news_item to collection in PG
export const saveNewsToPG = (formValues, option) => {
    //param formValues: consists of news_item values
    //param option: check for news from api or not
    return async (dispatch, getState) => {
        try {
            if (!formValues.author || !formValues.title || !formValues.imageUrl || !formValues.description || !formValues.articleUrl || !formValues.sourceName) {
                // if news is from api then form validation is not performed since there maybe missing values
                if(option !== 'news from api' ) {
                await dispatch({type: CHANGE_STATUS, payload: {statuscode: 400}});
                }
            } else {
                await axios.post('http://localhost:5000/pgcollection/v1/news/postNews', formValues)
                  .then(function (response) {
                    if(option !== 'news from api' ) {
                    dispatch({type: CHANGE_STATUS, payload: {statuscode: 200}})
                    }
                    if (response.data.success) {
                        alert('Article added to your collection');
                    } else if (!response.data.success) {
                        alert('Article already exists in your collection');
                    }
                  })
                  .catch(function (error) {
                    if(option !== 'news from api' ) {
                    dispatch({type: CHANGE_STATUS, payload: {statuscode: 400}})
                    }
                    console.log(error);
                  });
            }
            await dispatch(getNewsFromPG)
        } catch (err) {
            console.error(err);
        }
    };
};

// Delete news item from PG
export const deleteNewsFromPG = (articleurl) => {
    return async (dispatch, getState) => {
        try {
            await axios.delete('http://localhost:5000/pgcollection/v1/news/deleteNews', { data: { id: articleurl } })
            .then(function (response) {
                console.log(response);
              })
              .catch(function (error) {
                console.log(error);
              });
            await dispatch(getNewsFromPG)
        } catch(err) {
            console.error(err);
        }
    };
};

// Update news item in PG

export const updateNewsToPG = () => {
    return async (dispatch, getState) => {
        try {
            await axios.patch('http://localhost:5000/pgcollection/v1/news/updateNews', { data: { formValues: getState().collections.formValues } })
            .then(function (response) {
                dispatch({type: CHANGE_STATUS, payload: {statuscode: 200}})
                console.log(response);
              })
              .catch(function (error) {
                dispatch({type: CHANGE_STATUS, payload: {statuscode: 400}})
                console.log(error);
              });
            await dispatch({type: TOGGLE_IS_EDITING})
            await dispatch(getNewsFromPG)
        } catch(err) {
            console.error(err);
        }
    };
};

import React, { useEffect, useState, useContext } from 'react'
import SelectSearch from 'react-select-search';
import { TagsContext } from '../../Contexts';

const TagSelect = ({onChange, value, isAll=false}) => {
  const tags = useContext(TagsContext);
  const [tagOptions, setTagOptions] = useState([]);

  useEffect(()=>{
    setTagOptions(tags.map((e, index) => {return {name: e.text, value: e._id, disabled: false}}));
  }, [tags]);

  const removeTag = (e) =>{
    let id = e.currentTarget.id;
    let temp = tagOptions.map(o=>o._id===id?{...o, disabled: false}:o);
    setTagOptions(temp);
    temp = value.map(t=>t.value===id?null:t).filter(t=>t!==null);
    onChange(temp);
  };

  const addTag = (i) => {
    let temp = tagOptions.map(o=>o._id===i?{...o, disabled: true}:o);
    setTagOptions(temp);
    temp = value.slice();
    temp.push({name: tagOptions.find(t=>t.value===i).name, value: i});
    onChange(temp);
  };

  if(tagOptions.length === 0){
    return;
  }

  return <>
  <div className='productTags'>
    {value.map(tag=>(<div className='productTag' key={tag.name}><p className='productTagName'>{tag.name}</p><span id={tag.value} onClick={removeTag}>x</span></div>))}
    {isAll&&value.length===0&&<div className='productTag' style={{width: "50px"}}><p className='productTagName'>All</p></div>}
  </div>
  <SelectSearch onChange={addTag} search={true} getOptions={()=>tagOptions.filter((tag)=>tag.disabled === false)} name="tag" placeholder="Choose Your Tags" renderValue={(valueProps) =>
    <div className='input1'>
      <label>
      <input type='text' required {...valueProps} placeholder=''/>
      <span>{valueProps.placeholder}</span>
      </label>
    </div>} renderOption={(optionsProps, optionsData) => {
        return value.find(t=>t.name===optionsData.name) ? null : <button className='select-search-option' {...optionsProps}>{optionsData.name}</button>
    }} />
  </>
}


export default TagSelect;
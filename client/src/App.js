import React, { Component } from 'react';
import './App.css';

const contains = (arr, el) => arr.indexOf(el) > -1;
const decodeArr = (arr) => arr.split('__,__').map(el => parseInt(el));

const VIEWS = ['cards', 'list'];
const FILTERS = ['all', 'none'];
const MODES = ['view', 'edit'];

class App extends Component {
  constructor() {
    super();
    this.state = {
      tagList: [],
      selectedTags: [],
      view: 'cards',
      defaultFilter: 'all',
      search: '',
      submit: '',
      mode: 'view',
      ideaList: [],
      focus: '',
      newTag: false,
      submitTag: '',
    }
  }

  componentDidMount() {
    fetch('/api/fetchAllIdeas')
      .then(res => res.json())
      .then(out => {
        const parsedOut = out.map(idea => {
          const { rowid, label, tags } = idea;
          return {
            rowid: rowid,
            label: label,
            tags: decodeArr(tags),
          };
        })
        this.setState({
          ideaList: parsedOut,
        });
      });

    fetch('/api/fetchAllTags')
      .then(res => res.json())
      .then(out => {
        const parsedOut = out.map(tag => {
          const { rowid, label } = tag;
          return {
            rowid: rowid,
            label: label,
          };
        })
        this.setState({
          tagList: parsedOut,
        });
      });
  }

  handleSubmit() {
    const newIdeaList = this.state.ideaList;

    const newIdea = {
      label: this.state.submit,
      tags: this.state.selectedTags,
    };

    fetch(`/api/insert/${JSON.stringify(newIdea)}`)
      .then(res => res.json())
      .then(out => {
        newIdea.rowid = out;
        newIdeaList.push(newIdea);
        this.setState({
          ideaList: newIdeaList,
          selectedTags: [],
          submit: '',
        });
      });
  }

  renderTextField(type, idx, defaultValue, rowid) {
    const id = this.getId(type, idx);
    return (
      <span>
        <input
          type="text"
          id={id}
          defaultValue={defaultValue}
          onFocus={this.handleFocus.bind(this, id)}
          onBlur={this.handleBlur.bind(this)}
        />
        {this.renderSaveCancel(type, idx, rowid)}
      </span>
    );
  }

  renderOptions(list, stateField) {
    return list.map(el => {
      const selectedClass = this.state[stateField] ===  el ? 'selected' : '';
      return (
        <div
          key={el}
          className={`${selectedClass} filter`}
          onClick={() => this.setState({ [stateField]: el })}
        >
          {el}
        </div>
      );
    });
  }

  handleClick(value) {
    console.log('clicking');
    if (contains(this.state.selectedTags, value)) {
      this.setState({ selectedTags: this.state.selectedTags.filter(tag => tag !== value) });
    }
    else {
      this.setState({ selectedTags: [...this.state.selectedTags, value] });
    }
  }

  newTag() {
    this.setState({
      newTag: true,
    });
  }

  newTagChange() {

  }

  saveLabel(idx, idea) {
    const newTagList = this.state.tagList;
    const value = document.getElementById(`tag-${idx}`).value;

    newTagList[idx].label = value;
    this.setState({ tagList: newTagList });

    // const updateObj = {
    //   rowid: idea.rowid,
    //   label: value,
    // };
    // fetch(`api/update/${JSON.stringify(updateObj)}`);
  }

  renderNewTagButton() {
    return this.state.newTag ? (
      <div className="new-tag">
        <input
          type="text"
          value={this.state.submitTag}
          onChange={this.newTagChange.bind(this)}
        />
        <span className="new-tag__save">
          Save
        </span>
        <span className="new-tag__cancel">
          X
        </span>
      </div>
    ) : (
      <div
        className={`filter`}
        onClick={this.newTag.bind(this)}
      >
        +
      </div>
    );
  }

  renderTagButtons() {
    const { tagList } = this.state;
    return tagList.map((tagObj, idx) => {
      const selectedClass = contains(this.state.selectedTags, tagObj.rowid) ? 'selected' : '';
      const colorClass = this.state.view === 'list' ? tagObj.key : '';
      return (
        <div
          className={`filter ${selectedClass} ${colorClass} tag-${tagObj.rowid}`}
          key={tagObj.rowid}
          onClick={this.handleClick.bind(this, tagObj.rowid)}
        >
          {this.renderTextField('tag', idx, tagObj.label, tagObj.rowid)}
        </div>
      );
    })
  }

  getTagObjs(tagKeys) {
    return this.state.tagList.filter(tagObj => tagKeys.indexOf(tagObj.rowid) > -1);
  }

  renderTags(ideaTags) {
    const tagEls = this.getTagObjs(ideaTags).map(tagObj => (
      <span
        className={`${this.state.view}-tag tag-${tagObj.rowid}`}
        key={tagObj.rowid}
        data-content={tagObj.label}
      >
        {this.state.view === 'cards' ? tagObj.label : ''}
      </span>
    ));
    return (
      <div className={`${this.state.view}-tags-wrapper`}>
        {tagEls}
      </div>
    );
  }

  getSearchResults() {
    return this.state.ideaList.filter(idea => {
      return idea.label.toLowerCase().indexOf(this.state.search.toLowerCase()) > -1;
    });
  }

  deleteItem(type, rowid) {
    const field = this.getField(type);
    const newList = this.state[field];
    fetch(`api/delete/${type}/${rowid}`)
      .then(this.setState({
        [field]: newList.filter(item => item.rowid !== rowid),
      }));
  }

  handleFocus(id, e) {
    console.log('focusing');
    e.nativeEvent.stopImmediatePropagation();
    e.stopPropagation();

    this.setState({ focus: id });
  }

  handleBlur() {
    this.setState({ focus: '' });
  }

  getId(type, idx) {
    return `${type}-${idx}`;
  }

  renderSaveCancel(type, idx, rowid) {
    const style = {
      opacity: this.state.focus === this.getId(type, idx) ? 1 : 0,
    };
    return (
      <span>
        <span style={style} onClick={this.saveItem.bind(this, type, idx, rowid)}>Save</span>
        <span style={style} onClick={this.cancelItem.bind(this, type, idx)}>Cancel</span>
      </span>
    );
  }

  getField(type) {
    return `${type}List`;
  }

  saveItem(type, idx, rowid) {
    const field = this.getField(type);
    const newList = this.state[field];
    const value = document.getElementById(this.getId(type, idx)).value;

    newList[idx].label = value;
    this.setState({ [field]: newList });

    const updateObj = {
      rowid: rowid,
      label: value,
    };
    fetch(`api/update/${JSON.stringify(updateObj)}`);
  }

  cancelItem(type, idx) {
    const input = document.getElementById(this.getId(type, idx));
    input.value = input.defaultValue;
  }

  renderIdeas() {
    return this.getSearchResults().map((idea, idx) => {
      if ((this.state.defaultFilter === 'none' && idea.tags.filter(tag => contains(this.state.selectedTags, tag)).length > 0)
        || (this.state.defaultFilter === 'all' && idea.tags.filter(tag => contains(this.state.selectedTags, tag)).length < 1)) {
        return (
          <div key={idx} className={`${this.state.view}-idea`}>
            <div onClick={this.deleteItem.bind(this, 'idea', idea.rowid)}>X</div>
            {this.renderTextField('idea', idx, idea.label, idea.rowid)}
            {this.renderTags(idea.tags)}
          </div>
        );
      }
      return null;
    });
  }

  handleChange(field, e) {
    this.setState({
      [field]: e.target.value,
      selectedTags: [],
    });
  }

  renderInput(stateField) {
    return (
      <input
        className="search"
        value={this.state[stateField]}
        onChange={this.handleChange.bind(this, stateField)}
      />
    );
  }

  maybeRenderViewMode() {
    return this.state.mode === 'view' && (
      <span>
        <div className="search-wrapper">
          Search:
          {this.renderInput('search')}
        </div>
        <div className="view-wrapper">
          View As:
          {this.renderOptions(VIEWS, 'view')}
        </div>
        <div className="filter-wrapper">
          Default View:
          {this.renderOptions(FILTERS, 'defaultFilter')}
        </div>
        <div className="tag-wrapper">
          {this.renderTagButtons()}
          {this.renderNewTagButton()}
        </div>
        <div className="ideas-wrapper">
          {this.renderIdeas()}
        </div>
      </span>
    );
  }

  maybeRenderEditMode() {
    return this.state.mode === 'edit' && (
      <span>
        <div className="search-wrapper">
          Submit:
          {this.renderInput('submit')}
        </div>
        <div className="tag-wrapper">
          {this.renderTagButtons()}
        </div>
        <div className="filter submit-button" onClick={this.handleSubmit.bind(this)}>
          Submit
        </div>
      </span>
    );
  }

  render() {
    return (
      <div className="App">
        <div>
          {this.renderOptions(MODES, 'mode')}
        </div>
        {this.maybeRenderViewMode()}
        {this.maybeRenderEditMode()}
      </div>
    );
  }
}

export default App;

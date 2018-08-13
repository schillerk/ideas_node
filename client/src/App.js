import React, { Component } from 'react';
import './App.css';

function contains(arr, el) {
  return arr.indexOf(el) > -1;
}

const TAGS = {
  research: "Research",
  public: "Public",
  ethics: "Ethics / Accountability",
  new: "New Areas",
  internal: "Internal",
  collab: "Collaboration",
  dash: "Dashboards",
  ux: "UX / Usability",
  features: "Features",
  impact: "Impact / M&E",
  ml: "ML / AI",
  analysis: "Analysis",
  training: "Training, Documentation",
  data: "Data Quality / New Data",
  viz: "New and Improved Visualizations",
  moonshot: "Moonshots",
  culture: "Culture",
  events: "Events",
  values: "Values",
};

const VIEWS = ['cards', 'list'];
const FILTERS = ['all', 'none'];
const MODES = ['view', 'edit'];



class App extends Component {
  constructor() {
    super();
    const setTags = window.location.hash == '#offsite' ? ['culture', 'events', 'values'] : [];
    const setFilters = window.location.hash == '#offsite' ? 'none' : 'all';
    console.log(window.location.hash);
    console.log(setTags);
    this.state = {
      selectedTags: setTags,
      view: 'cards',
      defaultFilter: setFilters,
      search: '',
      submit: '',
      mode: 'view',
      ideaList: [],
    }
  }

  componentDidMount() {
    fetch('/api/ideas')
      .then(res => res.json())
      .then(out => {
        this.setState({
          ideaList: out.map(datum => {
            // This is dumb, basically something stupid happened when
            // I switched from flask to node
            if (JSON.parse(datum).label) {
              return JSON.parse(datum);
            } else {
              return JSON.parse(JSON.parse(datum));
            }
          })
        });
      });
  }

  handleSubmit() {
    const newIdea = {
      label: this.state.submit.replace('/', '|'),
      tags: this.state.selectedTags,
    };

    fetch(`/api/submit/${JSON.stringify(newIdea)}`);

    this.setState({
      selectedTags: [],
      submit: '',
      ideaList: [...this.state.ideaList, newIdea],
    });
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
    console.log(this.state.selectedTags);
    if (contains(this.state.selectedTags, value)) {
      this.setState({ selectedTags: this.state.selectedTags.filter(tag => tag !== value) });
    }
    else {
      this.setState({ selectedTags: [...this.state.selectedTags, value] });
    }
  }

  renderTagButtons() {
    return Object.keys(TAGS).map(tag => {
      const selectedClass = contains(this.state.selectedTags, tag) ? 'selected' : '';
      const colorClass = this.state.view === 'list' ? tag : '';
      return (
        <div
          className={`filter ${selectedClass} ${colorClass} ${tag}`}
          key={tag}
          onClick={this.handleClick.bind(this, tag)}
        >
          {TAGS[tag]}
        </div>
      );
    })
  }

  renderTags(ideaTags) {
    const tagEls = ideaTags.map(tag => (
      <span className={`${this.state.view}-tag ${tag}`} key={tag} data-content={TAGS[tag]}>
        {this.state.view === 'cards' ? TAGS[tag] : ''}
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

  renderIdeas() {
    return this.getSearchResults().map(idea => {
      if ((this.state.defaultFilter === 'none' && idea.tags.filter(tag => contains(this.state.selectedTags, tag)).length > 0)
        || (this.state.defaultFilter === 'all' && idea.tags.filter(tag => contains(this.state.selectedTags, tag)).length < 1)) {
        return (
          <div key={idea.label} className={`${this.state.view}-idea`}>
            {idea.label}
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
    return this.state.mode == 'view' && (
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
        </div>
        <div className="ideas-wrapper">
          {this.renderIdeas()}
        </div>
      </span>
    );
  }

  maybeRenderEditMode() {
    return this.state.mode == 'edit' && (
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
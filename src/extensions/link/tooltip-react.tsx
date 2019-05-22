import * as React from 'react';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/fontawesome-free-solid'
import styled from 'styled-components';

const Tooltip = styled.div`
  position: absolute;
  display: inline-block;
  z-index: 1000;
  background-color: #FFF;
  color: #777;
  padding: 5px;
  font-size: 16px;
  box-shadow: 0 3px 40px 8px rgba(116,116,116,0.2);
  border-radius: 5px;
  width: 250px;
  input {
    font-size: 16px;
  }
`;

const Button = styled.button`
  border: none;
  background-color: #FFF;
  color: #777;
  margin-left: 5px;
  font-size: 16px;
`;

const Label = styled.label`
  display: inline-block;
  width: 200px;
`;

type TooltipReactProps = {
  style: React.CSSProperties
  url: string,
  onClick(url: string): void
}

type TooltipReactState = {
  newUrl: string,
  editing: boolean
}

export default class TooltipReact extends React.Component<TooltipReactProps, TooltipReactState> {
  constructor(props) {
    super(props);
    this.state = {
      newUrl: props.url,
      editing: false
    }
  }

  componentWillReceiveProps(nextProps, prevProps) {
    if (nextProps.url !== prevProps.url) {
      this.setState({
        newUrl: nextProps.url
      })
    }
  }

  render() {
    const { style } = this.props;
    const { newUrl, editing } = this.state;

    return (<Tooltip style={style}>
      {editing && <>
        <input 
          type="text" 
          value={newUrl} 
          placeholder="https://"
          onChange={(e) => {
            this.setState({
              newUrl: e.target.value
            })
          }} 
        />
        <Button onClick={() => {
          this.setState({
            editing: false
          })
          this.props.onClick(this.state.newUrl);
        }}>OK</Button>
      </>}
      {!editing && <>
        <Label>{newUrl}</Label>
        <Button onClick={() => {
          this.setState({
            editing: true
          })
        }}>
          <FontAwesomeIcon icon={faEdit} />
        </Button>
      </>}
    </Tooltip>);
  }
}
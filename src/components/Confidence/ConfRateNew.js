import React from 'react'
import { Slider, Rail, Handles, Tracks, Ticks } from 'react-compound-slider'
import { Handle, Track, TooltipRail, Tick } from './components' // example render components - source below
import PropTypes from 'prop-types'

import './ConfRateNew.css'


const sliderStyle = {
  position: 'relative',
  width: '100%',
}

const domain   = [50, 100]
var myArray    = [55, 65, 70, 77, 85, 95]; 



class ConfRate extends React.Component {

  constructor(props){
    super(props);

    const defaultValues = [myArray[Math.floor(Math.random() * myArray.length)]]; 
    // console.log('Generate default value',defaultValues)


    this.state = {
    values: defaultValues.slice(),
    update: defaultValues.slice(),
    start_conf: new Date(), 
    conf_init: defaultValues.slice()
  }; 


   this.onUpdate.bind(this)
   this.onChange.bind(this)
   this.handleMouseUp.bind(this) 
  
  }; 

  
  onUpdate = update => {
    this.setState({ update })
  }

  onChange = values => {
    this.setState({ values })
  }

  handleMouseUp = event => {
      // console.log('Mouse event up!', event)
      var date = new Date()
      var conf = this.state.update[0] 

      var rt_conf  = date.getTime() - this.state.start_conf

      // console.log('Conf value update is:', conf)
      // console.log('Conf init is:',this.state.conf_init)
      
      this.props.confClicked(conf,rt_conf, this.state.conf_init)
  
    }

  render() {
    const {
      state: { values, update },
    } = this

    // console.log('update',this.state.update)
   
    return (

      <div> 
      
      <div className='sliderText'>How confident are you?</div>
      <span className='slider-val'>Very uncertain</span>
      <span className='slider-val'>Very certain</span>
      
      
      <div style={{ height: 120, width: '50%', marginTop:30}}>
        <Slider
          mode     ={1}
          step     ={1}
          domain   ={domain}
          rootStyle={sliderStyle}
          onUpdate ={this.onUpdate}
          onChange ={this.onChange}
          values   ={values}
        >
          <Rail>{railProps => <TooltipRail {...railProps} />}</Rail>
          <Handles>
            {({ handles, activeHandleID, getHandleProps }) => (
              <div className="slider-handles">
                {handles.map(handle => (
                  <Handle
                    key           ={handle.id}
                    handle        ={handle}
                    domain        ={domain}
                    isActive      ={handle.id === activeHandleID}
                    getHandleProps={getHandleProps}
                    handleMouseUp = {this.handleMouseUp} 
                  />
                ))}
              </div>
            )}

          </Handles>
          <Tracks right={false}>
            {({ tracks, getTrackProps }) => (
              <div className="slider-tracks">
                {tracks.map(({ id, source, target }) => (
                  <Track
                    key={id}
                    source={source}
                    target={target}
                    getTrackProps={getTrackProps}
                  />
                ))}
              </div>
            )}
          </Tracks>
        </Slider>
      </div>
      </div>
    )
  }
}

export default ConfRate


ConfRate.propTypes = {
    confClicked: PropTypes.func.isRequired
  }

// You can add Ticks to the scale after the Track element in the render within the slider 
 // <Ticks count={5 /* generate approximately 15 ticks within the domain */}>
 //            {({ ticks }) => (
 //          <div className="slider-ticks">
 //            {ticks.map(tick => (
 //              <Tick key={tick.id} tick={tick} count={ticks.length} />
 //          ))}
 //          </div>
 //      )}
 //    </Ticks>

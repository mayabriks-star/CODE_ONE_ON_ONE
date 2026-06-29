import './Attribution.css'

// Bottom-left credits. Google requires its attribution string shown while the
// photoreal tiles are loaded; falls back to a generic credit until it arrives.
const Attribution = ({ googleCredits }) => {
  return (
    <div className="attribution">
      <span>{googleCredits || 'Imagery © Google'}</span>
    </div>
  )
}

export default Attribution

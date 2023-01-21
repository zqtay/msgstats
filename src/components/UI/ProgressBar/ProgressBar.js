const ProgressBar = (props) => {
  return (
    <div className={"progressBar"}>
      {`${props.value} / ${props.max}`}
    </div>
  );
}

export default ProgressBar;
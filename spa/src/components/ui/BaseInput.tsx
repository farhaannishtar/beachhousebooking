interface BaseInputProps {
    preIcon?: string,
    postIcon?: string,
    value: string | number;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
    className?: string;
    name: string
}
const BaseInput: React.FC<BaseInputProps> = ({ className = '', type = 'text', value, onChange, preIcon, postIcon, placeholder = '', name }) => {
  return (
    <div className={`${className} bg-typo_light-100 flex justify-between items-center h-14 rounded-xl`}>

      {
        preIcon ? <div className="rounded-s-xl flex items-center px-4 h-full">
          <span className="material-symbols-outlined">{preIcon}</span>
        </div> : ''
      }
      <input className={`${preIcon ? '' : 'rounded-s-xl pl-4'} ${postIcon ? '' : 'rounded-e-xl pr-4'} h-full flex-1 bg-typo_light-100 size-1 `} value={value} onChange={(event) => {
        if (onChange) {
          onChange(event);
        }
      }} placeholder={placeholder} type={type} name={name} />
      {
        postIcon ? <div className="rounded-e-xl flex items-center px-4 h-full">
          <span className="material-symbols-outlined">{postIcon}</span>
        </div> : ''
      }
    </div>
  )
}

export default BaseInput;

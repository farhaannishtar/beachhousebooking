interface BaseInputProps {
    value: string,
    preIcon: string,
    postIcon: string,
    onChange:(event: React.ChangeEvent<HTMLInputElement>) => void;
}
const BaseInput: React.FC<BaseInputProps> = ({ value, onChange,preIcon,postIcon }) => {
    return(
        <div className="bg-typo_light-100 flex justify-between items-center h-14 rounded-xl">
            <div className="rounded-s-xl flex items-center px-4 h-full">
            <span className="material-symbols-outlined">{preIcon}</span>
            </div>
            <input type="text" className={`${postIcon?'':'rounded-e-xl'} ${postIcon?'':'rounded-s-xl'} h-full flex-1 bg-typo_light-100`} value={value} onChange={onChange} />
           {
            postIcon? <div className="rounded-s-xl flex items-center px-4 h-full">
            <span className="material-symbols-outlined">{preIcon}</span>
            </div>:''
           }
        </div>
    )
}

export default BaseInput;

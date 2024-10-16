interface SearchInputProps {
  value: string | undefined;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterClick?: () => void | undefined;
  filterIsOn?: boolean;
  className?: string
}
const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onFilterClick,
  filterIsOn,
  className
}) => {
  return (
    <div className={`bg-typo_light-100 flex justify-between items-center h-12 rounded-xl ${className}`}>
      <div className="rounded-s-xl flex items-center px-4 h-full">
        <span className="material-symbols-outlined">search</span>
      </div>
      <input
        type="text"
        className="h-full flex-1 bg-typo_light-100"
        value={value}
        onChange={onChange}
      />
      <div className="rounded-s-xl flex items-center px-4 h-full">
        <span
          className={`material-symbols-outlined cursor-pointer ${filterIsOn ? " !text-selectedButton" : ""}`}
          onClick={() => {
            if (onFilterClick) {
              onFilterClick();
            }
          }}
        >
          tune
        </span>
      </div>
    </div>
  );
};

export default SearchInput;

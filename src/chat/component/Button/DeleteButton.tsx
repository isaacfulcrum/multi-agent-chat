import { DeleteIcon } from "@chakra-ui/icons";
import { IconButton, Tooltip } from "@chakra-ui/react";

type Props = {
  onClick: () => void;
};

// ********************************************************************************
export const DeleteButton: React.FC<Props> = ({ onClick }) => {
  return (
    <Tooltip label="Delete" placement="right" >
      <IconButton
        size="xs"
        fontSize="14px"
        onClick={onClick}
        variant="outline"
        aria-label="Delete"
        icon={<DeleteIcon />}
        colorScheme="whiteAlpha"
      />
    </Tooltip>
  );
};

export default DeleteButton;


import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import useCopyToClipboard from 'react-use/lib/useCopyToClipboard';
import { toaster } from '../../../actions';
import styles from './agent-setup.module.scss';

const dockerInstructions = `docker run -dit --cpus=".2" --name=deepfence-agent --restart on-failure --pid=host --net=host \\
  --privileged=true -v /sys/kernel/debug:/sys/kernel/debug:rw -v /var/log/fenced \\
  -v /var/run/docker.sock:/var/run/docker.sock -v /:/fenced/mnt/host/:ro \\
  -e USER_DEFINED_TAGS="" -e MGMT_CONSOLE_URL="${window.location.origin ?? '---CONSOLE-IP---'}" -e MGMT_CONSOLE_PORT="443" \\
  -e DEEPFENCE_KEY="${localStorage.getItem('dfApiKey') ?? '---DEEPFENCE-API-KEY---'}" \\
  deepfenceio/deepfence_agent_ce:${process.env.__PRODUCTVERSION__}
`;

const k8sInstructions = `helm repo add deepfence https://deepfence-helm-charts.s3.amazonaws.com/threatmapper

helm install deepfence-agent deepfence/deepfence-agent \\
    --version ${process.env.__PRODUCTVERSION__} \\
    --set managementConsoleUrl=${window.location.origin ?? '---CONSOLE-IP---'} \\
    --set deepfenceKey=${localStorage.getItem('dfApiKey') ?? '---DEEPFENCE-API-KEY---'}`;

export const AgentSetup = () => {

  const dispatch = useDispatch();

  const [state, copyToClipboard] = useCopyToClipboard();

  function onDockerCopyClick() {
    copyToClipboard(dockerInstructions);
  }

  function onK8sCopyClick() {
    copyToClipboard(k8sInstructions);
  }

  useEffect(() => {
    if (state.value) {
      dispatch(toaster('Copied successfully.'));
    } else if (state.error) {
      dispatch(toaster('Failed to copy.'));
    }
  }, [state]);

  return (
    <div className={styles.wrapper}>
      <p>Please follow the instructions below to set-up deepfence agent.</p>
      <div className={styles.setupHeader}>
        Docker:
      </div>
      <div className={styles.codeBlock}>
        {
          dockerInstructions
        }
        <i className={`fa fa-copy ${styles.copyButton}`} onClick={onDockerCopyClick} />
      </div>
      <div className={styles.setupHeader}>
        K8s:
      </div>
      <div className={styles.codeBlock}>
        {
          k8sInstructions
        }
        <i className={`fa fa-copy ${styles.copyButton}`} onClick={onK8sCopyClick} />
      </div>
    </div>
  )
}